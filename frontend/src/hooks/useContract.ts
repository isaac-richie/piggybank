import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, USDC_ADDRESS, TIMELOCK_PIGGY_BANK_ABI, USDC_ABI } from '@/lib/contracts';
import { parseUSDC, parseETH, formatUSDC, formatETH } from '@/lib/utils';

// Hook for reading contract data
export const useTimelockPiggyBank = () => {
  const { address } = useAccount();

  // Get user deposit count
  const { data: depositCount = 0n, refetch: refetchDepositCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getUserDepositCount',
    args: address ? [address] : undefined,
  });

  // Get total locked amount
  const { data: totalLocked = 0n, refetch: refetchTotalLocked } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getTotalLockedAmount',
    args: address ? [address] : undefined,
  });

  // Get contract USDC balance
  const { data: contractUSDCBalance = 0n, refetch: refetchUSDCBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getContractBalance',
  });

  // Get contract ETH balance
  const { data: contractETHBalance = 0n, refetch: refetchETHBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getContractETHBalance',
  });

  // Get valid lock durations
  const { data: lockDurations = [] } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getValidLockDurations',
  });

  // Get contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'owner',
  });

  // Check if contract is paused
  const { data: isPaused = false } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'paused',
  });

  const refetchAll = () => {
    refetchDepositCount();
    refetchTotalLocked();
    refetchUSDCBalance();
    refetchETHBalance();
  };

  return {
    depositCount: Number(depositCount),
    totalLockedUSDC: formatUSDC(totalLocked),
    totalLockedETH: "0", // This will be calculated separately for ETH deposits
    contractUSDCBalance: formatUSDC(contractUSDCBalance),
    contractETHBalance: formatETH(contractETHBalance),
    lockDurations: lockDurations as bigint[],
    owner,
    isPaused,
    refetchAll,
  };
};

// Hook for getting specific deposit
export const useDeposit = (depositId: number) => {
  const { address } = useAccount();

  const { data: deposit, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getDeposit',
    args: address ? [address, BigInt(depositId)] : undefined,
  });

  return {
    deposit,
    isLoading,
    error,
    refetch,
  };
};

// Hook for USDC operations
export const useUSDC = () => {
  const { address } = useAccount();

  // Get USDC balance
  const { data: balance = 0n, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get allowance
  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS as `0x${string}`] : undefined,
  });

  const refetchAll = () => {
    refetchBalance();
    refetchAllowance();
  };

  return {
    balance: formatUSDC(balance),
    allowance: formatUSDC(allowance),
    refetchAll,
  };
};

// Hook for contract write operations
export const useContractWrite = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Deposit USDC
  const depositUSDC = async (amount: string, lockDuration: bigint, beneficiary: string) => {
    console.log('Calling depositUSDC with:', { amount, lockDuration, beneficiary });
    return writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'depositUSDC',
      args: [parseUSDC(amount), lockDuration, beneficiary as `0x${string}`],
    });
  };

  // Deposit ETH
  const depositETH = async (lockDuration: bigint, beneficiary: string, value: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'depositETH',
      args: [lockDuration, beneficiary as `0x${string}`],
      value,
    });
  };

  // Withdraw deposit
  const withdraw = async (depositId: number) => {
    return writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'withdraw',
      args: [BigInt(depositId)],
    });
  };

  // Forward deposit
  const forwardDeposit = async (depositId: number, to: string) => {
    return writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'forwardDeposit',
      args: [BigInt(depositId), to as `0x${string}`],
    });
  };

  // Approve USDC
  const approveUSDC = async (amount: string) => {
    return writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS as `0x${string}`, parseUSDC(amount)],
    });
  };

  return {
    depositUSDC,
    depositETH,
    withdraw,
    forwardDeposit,
    approveUSDC,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
};
