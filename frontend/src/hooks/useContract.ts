import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, USDC_ADDRESS, WBTC_ADDRESS, TIMELOCK_PIGGY_BANK_ABI, USDC_ABI, WBTC_ABI } from '@/lib/contracts';
import { parseUSDC, formatUSDC, formatETH, parseWBTC, formatWBTC } from '@/lib/utils';

// Hook for reading contract data
export const useTimelockPiggyBank = () => {
  const { address } = useAccount();

  // Get user deposit count
  const { data: depositCount = 0n, refetch: refetchDepositCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getUserDepositCount',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get total locked USDC
  const { data: totalLockedUSDC = 0n, refetch: refetchTotalLockedUSDC } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getTotalLockedUSDC',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get total locked ETH
  const { data: totalLockedETH = 0n, refetch: refetchTotalLockedETH } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getTotalLockedETH',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get total locked WBTC
  const { data: totalLockedWBTC = 0n, refetch: refetchTotalLockedWBTC } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getTotalLockedWBTC',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get active deposit count
  const { data: activeDepositCount = 0n, refetch: refetchActiveDepositCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getActiveDepositCount',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
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

  // Get contract WBTC balance
  const { data: contractWBTCBalance = 0n, refetch: refetchWBTCBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: TIMELOCK_PIGGY_BANK_ABI,
    functionName: 'getContractWBTCBalance',
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
    refetchActiveDepositCount();
    refetchTotalLockedUSDC();
    refetchTotalLockedETH();
    refetchTotalLockedWBTC();
    refetchUSDCBalance();
    refetchETHBalance();
    refetchWBTCBalance();
  };

  return {
    depositCount: Number(depositCount),
    activeDepositCount: Number(activeDepositCount),
    totalLockedUSDC: formatUSDC(totalLockedUSDC as bigint),
    totalLockedETH: formatETH(totalLockedETH as bigint),
    totalLockedWBTC: formatWBTC(totalLockedWBTC as bigint),
    contractUSDCBalance: formatUSDC(contractUSDCBalance as bigint),
    contractETHBalance: formatETH(contractETHBalance as bigint),
    contractWBTCBalance: formatWBTC(contractWBTCBalance as bigint),
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
    query: {
      refetchInterval: 3000, // Auto-refetch every 3 seconds for individual deposits
    },
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
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get allowance
  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS as `0x${string}`] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
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

// Hook for WBTC operations
export const useWBTC = () => {
  const { address } = useAccount();

  // Get WBTC balance
  const { data: balance = 0n, refetch: refetchBalance } = useReadContract({
    address: WBTC_ADDRESS as `0x${string}`,
    abi: WBTC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  // Get allowance
  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: WBTC_ADDRESS as `0x${string}`,
    abi: WBTC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS as `0x${string}`] : undefined,
    query: {
      refetchInterval: 5000, // Auto-refetch every 5 seconds
    },
  });

  const refetchAll = () => {
    refetchBalance();
    refetchAllowance();
  };

  return {
    balance: formatWBTC(balance),
    allowance: formatWBTC(allowance),
    refetchAll,
  };
};

// Hook for contract write operations
export const useContractWrite = () => {
  const publicClient = usePublicClient();
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Deposit USDC
  const depositUSDC = async (amount: string, lockDuration: bigint) => {
    console.log('Calling depositUSDC with:', { amount, lockDuration });
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'depositUSDC',
      args: [parseUSDC(amount), lockDuration],
    });
  };

  // Deposit ETH
  const depositETH = async (lockDuration: bigint, value: bigint) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'depositETH',
      args: [lockDuration],
      value,
    });
  };

  // Deposit WBTC
  const depositWBTC = async (amount: string, lockDuration: bigint) => {
    console.log('Calling depositWBTC with:', { amount, lockDuration });
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'depositWBTC',
      args: [parseWBTC(amount), lockDuration],
    });
  };

  // Top up USDC deposit
  const topUpUSDC = async (depositId: number, amount: string) => {
    console.log('Calling topUpUSDC with:', { depositId, amount });
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'topUpUSDC',
      args: [BigInt(depositId), parseUSDC(amount)],
    });
  };

  // Top up ETH deposit
  const topUpETH = async (depositId: number, value: bigint) => {
    console.log('Calling topUpETH with:', { depositId, value });
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'topUpETH',
      args: [BigInt(depositId)],
      value,
    });
  };

  // Top up WBTC deposit
  const topUpWBTC = async (depositId: number, amount: string) => {
    console.log('Calling topUpWBTC with:', { depositId, amount });
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'topUpWBTC',
      args: [BigInt(depositId), parseWBTC(amount)],
    });
  };

  // Withdraw deposit
  const withdraw = async (depositId: number) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'withdraw',
      args: [BigInt(depositId)],
    });
  };

  // Forward deposit
  const forwardDeposit = async (depositId: number, to: string) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: TIMELOCK_PIGGY_BANK_ABI,
      functionName: 'forwardDeposit',
      args: [BigInt(depositId), to as `0x${string}`],
    });
  };

  // Approve USDC
  const approveUSDC = async (amount: string) => {
    const txHash = await writeContractAsync({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS as `0x${string}`, parseUSDC(amount)],
    });
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    }
  };

  // Approve WBTC
  const approveWBTC = async (amount: string) => {
    const txHash = await writeContractAsync({
      address: WBTC_ADDRESS as `0x${string}`,
      abi: WBTC_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS as `0x${string}`, parseWBTC(amount)],
    });
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    }
  };

  return {
    depositUSDC,
    depositETH,
    depositWBTC,
    topUpUSDC,
    topUpETH,
    topUpWBTC,
    withdraw,
    forwardDeposit,
    approveUSDC,
    approveWBTC,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
};
