// Contract configuration and ABI
import TimelockABI from "./TimelockPiggyBank.abi.json";

// ============================================
// BASE MAINNET - PRODUCTION (LIVE)
// ============================================
export const CONTRACT_ADDRESS = "0xC5c0b76ebBF263DC4D28beA09B6F7BA2C023e820"; // Deployed on Base Mainnet
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC
export const WBTC_ADDRESS = "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c"; // Base Mainnet WBTC

export const NETWORK_CONFIG = {
  chainId: 8453, // Base Mainnet
  name: "Base",
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
};

// ============================================
// BASE SEPOLIA (TESTNET) - FOR TESTING
// ============================================
// export const CONTRACT_ADDRESS = "0xBa71207D0e8d7605FA6e001972C3c8B464Bd5F5B";
// export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
// export const WBTC_ADDRESS = "0xaa75cE9Ea5448d29e126039F142CB24c6312D5Ed"; // Base Sepolia WBTC
// export const NETWORK_CONFIG = {
//   chainId: 84532, // Base Sepolia
//   name: "Base Sepolia",
//   rpcUrl: "https://sepolia.base.org",
//   blockExplorer: "https://sepolia.basescan.org",
// };

// Lock durations in seconds (converted from months)
export const LOCK_DURATIONS = {
  "3 months": 90 * 24 * 60 * 60,   // 90 days
  "6 months": 180 * 24 * 60 * 60,  // 180 days
  "9 months": 270 * 24 * 60 * 60,  // 270 days
  "12 months": 360 * 24 * 60 * 60, // 360 days
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
