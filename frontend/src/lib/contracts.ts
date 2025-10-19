// Contract configuration and ABI
import TimelockABI from "./TimelockPiggyBank.abi.json";

export const CONTRACT_ADDRESS = "0xBa71207D0e8d7605FA6e001972C3c8B464Bd5F5B";
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const WBTC_ADDRESS = "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c";

export const NETWORK_CONFIG = {
  chainId: 8453, // Base Mainnet
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
};

// Lock durations in seconds
export const LOCK_DURATIONS = {
  "3 months": 7776000,   // 90 days
  "6 months": 15552000,  // 180 days
  "9 months": 23328000,  // 270 days
  "12 months": 31536000, // 365 days
} as const;

export type LockDuration = keyof typeof LOCK_DURATIONS;

// Contract ABI (imported from compiled contract)
export const TIMELOCK_PIGGY_BANK_ABI = TimelockABI;

// USDC ABI (simplified ERC20)
export const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "owner", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// WBTC ABI (simplified ERC20, same as USDC)
export const WBTC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "owner", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
