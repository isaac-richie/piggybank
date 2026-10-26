// Contract configuration and ABI
import TimelockABI from "./TimelockPiggyBank.abi.json";

// Network selection: NEXT_PUBLIC_NETWORK=base (default) or base-sepolia.
// NEXT_PUBLIC_CONTRACT_ADDRESS overrides the vault address for the chosen network.
const NETWORKS = {
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    contract: "0xC5c0b76ebBF263DC4D28beA09B6F7BA2C023e820",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    wbtc: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  },
  "base-sepolia": {
    chainId: 84532,
    name: "Base Sepolia",
    // Separate override so a mainnet NEXT_PUBLIC_RPC_URL never leaks into testnet runs.
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    contract: "0x3dB3FC8989d2fcEb51b9c9Cc94621eaE5eB52A68",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    wbtc: "0xaa75cE9Ea5448d29e126039F142CB24c6312D5Ed",
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

export const NETWORK_NAME: NetworkName =
  process.env.NEXT_PUBLIC_NETWORK === "base-sepolia" ? "base-sepolia" : "base";

const network = NETWORKS[NETWORK_NAME];

export const IS_TESTNET = NETWORK_NAME !== "base";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || network.contract;
export const USDC_ADDRESS = network.usdc;
export const WBTC_ADDRESS = network.wbtc;

export const NETWORK_CONFIG = {
  chainId: network.chainId,
  name: network.name,
  rpcUrl: network.rpcUrl,
  blockExplorer: network.blockExplorer,
};

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
