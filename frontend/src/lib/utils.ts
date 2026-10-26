import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatUnits, parseUnits } from 'viem';
import { LOCK_DURATIONS } from './contracts';

// shadcn/ui utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

// Format a base-unit amount for display without going through floats.
export const formatAmount = (value: bigint, decimals: number, maxFraction: number) => {
  if (value === 0n) return '0';
  const [int, frac = ''] = formatUnits(value, decimals).split('.');
  const trimmed = frac.slice(0, maxFraction).replace(/0+$/, '');
  if (int === '0' && !trimmed) return `<0.${'0'.repeat(Math.max(maxFraction - 1, 0))}1`;
  const intFormatted = BigInt(int).toLocaleString('en-US');
  return trimmed ? `${intFormatted}.${trimmed}` : intFormatted;
};

// Keep amount inputs to digits, one dot, and at most `decimals` fraction digits.
export const sanitizeAmountInput = (raw: string, decimals: number) => {
  const cleaned = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const [int, ...rest] = cleaned.split('.');
  if (rest.length === 0) return int;
  return `${int}.${rest.join('').slice(0, decimals)}`;
};

// Parse a user-entered amount; returns null for empty, zero or malformed input.
export const tryParseAmount = (amount: string, decimals: number): bigint | null => {
  if (!/^\d*\.?\d*$/.test(amount) || amount === '' || amount === '.') return null;
  try {
    const value = parseUnits(amount, decimals);
    return value > 0n ? value : null;
  } catch {
    return null;
  }
};

export const formatShortDate = (unixSeconds: number) =>
  new Date(unixSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
