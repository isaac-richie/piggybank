import { formatUnits, parseUnits } from 'viem';
import { LOCK_DURATIONS } from './contracts';

// Format USDC amounts (6 decimals)
export const formatUSDC = (amount: bigint) => {
  return formatUnits(amount, 6);
};

// Parse USDC amounts (6 decimals)
export const parseUSDC = (amount: string) => {
  return parseUnits(amount, 6);
};

// Format ETH amounts (18 decimals)
export const formatETH = (amount: bigint) => {
  return formatUnits(amount, 18);
};

// Parse ETH amounts (18 decimals)
export const parseETH = (amount: string) => {
  return parseUnits(amount, 18);
};

// Format WBTC amounts (8 decimals)
export const formatWBTC = (amount: bigint) => {
  return formatUnits(amount, 8);
};

// Parse WBTC amounts (8 decimals)
export const parseWBTC = (amount: string) => {
  return parseUnits(amount, 8);
};

// Format time duration
export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const months = Math.floor(days / 30);
  
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months >= 1) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
};

// Get lock duration in seconds
export const getLockDurationSeconds = (duration: keyof typeof LOCK_DURATIONS) => {
  return LOCK_DURATIONS[duration];
};

// Calculate unlock time
export const calculateUnlockTime = (depositTime: bigint, lockDuration: bigint) => {
  return Number(depositTime) + Number(lockDuration);
};

// Check if deposit is unlocked
export const isDepositUnlocked = (depositTime: bigint, lockDuration: bigint) => {
  const unlockTime = calculateUnlockTime(depositTime, lockDuration);
  return Date.now() / 1000 >= unlockTime;
};

// Format address for display
export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format date
export const formatDate = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

// Format date and time
export const formatDateTime = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

// Calculate time remaining
export const getTimeRemaining = (depositTime: bigint, lockDuration: bigint) => {
  const unlockTime = calculateUnlockTime(depositTime, lockDuration);
  const now = Date.now() / 1000;
  const remaining = unlockTime - now;
  
  if (remaining <= 0) return 'Unlocked';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};
