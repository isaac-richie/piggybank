import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from 'wagmi';
import { erc20Abi, type Abi, type Address, type Hash } from 'viem';
import { CONTRACT_ADDRESS, NETWORK_CONFIG, TIMELOCK_PIGGY_BANK_ABI, USDC_ADDRESS, WBTC_ADDRESS } from '@/lib/contracts';
import { type AssetSymbol } from '@/lib/assets';

const vault = {
  address: CONTRACT_ADDRESS as Address,
  abi: TIMELOCK_PIGGY_BANK_ABI as Abi,
  chainId: NETWORK_CONFIG.chainId,
} as const;

const TOKEN_ADDRESS: Record<Exclude<AssetSymbol, 'ETH'>, Address> = {
  USDC: USDC_ADDRESS as Address,
  WBTC: WBTC_ADDRESS as Address,
};

// Background refresh is slow on purpose: writes invalidate queries as soon as they confirm.
const REFRESH_MS = 20_000;

export type DepositData = {
  amount: bigint;
  lockDuration: bigint;
  depositTime: bigint;
  isWithdrawn: boolean;
  assetType: number;
};

export type Lock = DepositData & {
  id: number;
  unlockTime: number;
};

// One multicall for every vault-level number the dashboard needs.
export const usePortfolio = () => {
  const { address } = useAccount();
  const user = address as Address;

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...vault, functionName: 'getUserDepositCount', args: [user] },
      { ...vault, functionName: 'getActiveDepositCount', args: [user] },
      { ...vault, functionName: 'getTotalLockedUSDC', args: [user] },
      { ...vault, functionName: 'getTotalLockedETH', args: [user] },
      { ...vault, functionName: 'getTotalLockedWBTC', args: [user] },
    ],
    query: { enabled: !!address, refetchInterval: REFRESH_MS },
  });

  const [depositCount, activeCount, usdc, eth, wbtc] = (data ?? [0n, 0n, 0n, 0n, 0n]) as bigint[];

  return {
    isLoading,
    depositCount: Number(depositCount),
    activeCount: Number(activeCount),
    locked: { USDC: usdc, ETH: eth, WBTC: wbtc } as Record<AssetSymbol, bigint>,
  };
};

export const useVaultStatus = () => {
  const { data: isPaused = false } = useReadContract({
    ...vault,
    functionName: 'paused',
    query: { refetchInterval: 60_000 },
  });
  return { isPaused: isPaused as boolean };
};

// Reads every deposit in a single batched request instead of one poll per card.
export const useLocks = (depositCount: number) => {
  const { address } = useAccount();

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: Array.from({ length: depositCount }, (_, i) => ({
      ...vault,
      functionName: 'getDeposit',
      args: [address as Address, BigInt(i)],
    })),
    query: { enabled: !!address && depositCount > 0, refetchInterval: REFRESH_MS },
  });

  const locks: Lock[] = ((data ?? []) as DepositData[])
    .map((d, id) => ({ ...d, id, unlockTime: Number(d.depositTime + d.lockDuration) }))
    .filter((d) => d.amount > 0n)
    .reverse();

  return { locks, isLoading: isLoading && depositCount > 0 };
};

export const useWalletBalances = () => {
  const { address } = useAccount();
  const user = address as Address;
  const query = { enabled: !!address, refetchInterval: REFRESH_MS };

  const { data: eth } = useBalance({ address, chainId: NETWORK_CONFIG.chainId, query });
  const { data: tokens } = useReadContracts({
    allowFailure: false,
    contracts: [
      { address: TOKEN_ADDRESS.USDC, abi: erc20Abi, functionName: 'balanceOf', args: [user], chainId: NETWORK_CONFIG.chainId },
      { address: TOKEN_ADDRESS.WBTC, abi: erc20Abi, functionName: 'balanceOf', args: [user], chainId: NETWORK_CONFIG.chainId },
    ],
    query,
  });

  return {
    USDC: tokens?.[0],
    ETH: eth?.value,
    WBTC: tokens?.[1],
  } as Record<AssetSymbol, bigint | undefined>;
};

// `chain` is undefined when the wallet sits on a chain this app doesn't configure.
export const useIsWrongNetwork = () => {
  const { isConnected, chain } = useAccount();
  return isConnected && chain?.id !== NETWORK_CONFIG.chainId;
};

// Every write goes through `run`, which waits for the receipt (and any approval first)
// and then refreshes all reads. `pending` names the action in flight so only that
// button shows a spinner.
export const useVaultActions = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: NETWORK_CONFIG.chainId });
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const [pending, setPending] = useState<{ key: string; step: 'approve' | 'confirm' } | null>(null);

  const waitFor = async (hash: Hash) => {
    if (!publicClient) throw new Error('Network client unavailable. Please reconnect your wallet.');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('The transaction reverted on-chain.');
    return hash;
  };

  const ensureAllowance = async (key: string, asset: Exclude<AssetSymbol, 'ETH'>, amount: bigint) => {
    if (!publicClient || !address) throw new Error('Connect your wallet first.');
    const token = TOKEN_ADDRESS[asset];
    const allowance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address, vault.address],
    });
    if (allowance >= amount) return;

    setPending({ key, step: 'approve' });
    const hash = await writeContractAsync({
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [vault.address, amount],
      chainId: NETWORK_CONFIG.chainId,
    });
    await waitFor(hash);
  };

  const run = async (key: string, action: () => Promise<Hash>) => {
    setPending({ key, step: 'confirm' });
    try {
      return await waitFor(await action());
    } finally {
      setPending(null);
      queryClient.invalidateQueries();
    }
  };

  const write = (functionName: string, args: readonly unknown[], value?: bigint) =>
    writeContractAsync({ ...vault, functionName, args, value });

  const deposit = (asset: AssetSymbol, amount: bigint, lockDuration: bigint) =>
    run('deposit', async () => {
      if (asset === 'ETH') return write('depositETH', [lockDuration], amount);
      await ensureAllowance('deposit', asset, amount);
      setPending({ key: 'deposit', step: 'confirm' });
      return write(asset === 'USDC' ? 'depositUSDC' : 'depositWBTC', [amount, lockDuration]);
    });

  const topUp = (asset: AssetSymbol, depositId: number, amount: bigint) =>
    run(`topup-${depositId}`, async () => {
      if (asset === 'ETH') return write('topUpETH', [BigInt(depositId)], amount);
      await ensureAllowance(`topup-${depositId}`, asset, amount);
      setPending({ key: `topup-${depositId}`, step: 'confirm' });
      return write(asset === 'USDC' ? 'topUpUSDC' : 'topUpWBTC', [BigInt(depositId), amount]);
    });

  const withdraw = (depositId: number) =>
    run(`withdraw-${depositId}`, () => write('withdraw', [BigInt(depositId)]));

  const forward = (depositId: number, to: Address) =>
    run(`forward-${depositId}`, () => write('forwardDeposit', [BigInt(depositId), to]));

  return { deposit, topUp, withdraw, forward, pending, isBusy: pending !== null };
};

export const explorerTxUrl = (hash: string) => `${NETWORK_CONFIG.blockExplorer}/tx/${hash}`;

