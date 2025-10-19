# 🐷 Piggylock

**Build Wealth with Disciplined Crypto Savings**

A secure, production-ready smart contract platform for time-locked crypto savings. Lock your ETH, USDC, or WBTC for 3-12 months and commit to your financial goals. Built with Foundry and deployed on Base Mainnet.

## 🌟 Features

- **🪙 Multi-Asset Support**: Deposit ETH, USDC, and WBTC
- **⏰ Flexible Lock Durations**: 3, 6, 9, and 12 months
- **💎 Self-Discipline Tool**: Prevent impulsive trading and panic selling
- **📊 Multiple Deposits**: Each user can make unlimited deposits, tracked by unique IDs
- **🔓 Withdrawal**: Beneficiaries can withdraw unlocked deposits
- **➡️ Forwarding**: Send unlocked deposits to any address
- **🛡️ Security Features**: OpenZeppelin contracts, ReentrancyGuard, Pausable
- **👥 Whitelist Support**: Optional whitelist for controlled access
- **🔧 Admin Controls**: Owner can pause, rescue tokens, and manage whitelist

## 📋 Contract Details

### Deployed on Base Mainnet ✅
- **Contract**: `0xBa71207D0e8d7605FA6e001972C3c8B464Bd5F5B`
- **USDC Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **WBTC Token**: `0x0555E30da8f98308EdB960aa94C0Db47230d2B9c`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Verification**: ✅ Verified on Sourcify

### Asset Decimals
- **USDC**: 6 decimals (1 USDC = 1,000,000 units)
- **WBTC**: 8 decimals (1 WBTC = 100,000,000 units)
- **ETH**: 18 decimals (1 ETH = 10^18 wei)

### Lock Durations
- **3 months**: 7,776,000 seconds (90 days)
- **6 months**: 15,552,000 seconds (180 days)  
- **9 months**: 23,328,000 seconds (270 days)
- **12 months**: 31,536,000 seconds (365 days)

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd timelock-piggy-bank

# Install dependencies (OpenZeppelin contracts)
forge install
```

## Compilation

```bash
forge build
```

## Testing

```bash
# Run all tests
forge test

# Run tests with verbose output
forge test -vvv

# Run specific test
forge test --match-test testValidDeposit

# Run tests with gas reporting
forge test --gas-report
```

## Deployment

### Local Network (Anvil)
```bash
# Start local node
anvil

# In another terminal, deploy
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Testnet/Mainnet
```bash
# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy to Base Sepolia (Testnet)
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

# Deploy to Base Mainnet
forge script script/Deploy.s.sol --rpc-url base --broadcast --verify

# Deploy to other networks
forge script script/Deploy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY --broadcast --verify
forge script script/Deploy.s.sol --rpc-url https://mainnet.infura.io/v3/YOUR_INFURA_KEY --broadcast --verify
```

### Using Environment Variables
Create a `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
INFURA_KEY=your_infura_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

Then deploy:
```bash
source .env
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## Usage

### 1. Approve USDC Spending

Before depositing, users must approve the contract to spend their USDC:

```javascript
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
await usdcContract.approve(TIMELOCK_CONTRACT_ADDRESS, amount);
```

### 2. Deposit USDC

```javascript
const timelockContract = new ethers.Contract(TIMELOCK_ADDRESS, TIMELOCK_ABI, signer);

// Deposit 100 USDC for 3 months
const amount = ethers.parseUnits("100", 6); // 100 USDC (6 decimals)
const lockDuration = 90 * 24 * 60 * 60; // 3 months in seconds
const beneficiary = userAddress;

await timelockContract.deposit(amount, lockDuration, beneficiary);
```

### 3. Withdraw After Unlock

```javascript
// Check if deposit is unlocked
const isUnlocked = await timelockContract.isDepositUnlocked(userAddress, depositId);

if (isUnlocked) {
    // Withdraw to beneficiary
    await timelockContract.withdraw(depositId);
    
    // Or forward to another address
    await timelockContract.forwardDeposit(depositId, recipientAddress);
}
```

### 4. View Deposit Information

```javascript
// Get deposit details
const deposit = await timelockContract.getDeposit(userAddress, depositId);

// Get user's total deposit count
const depositCount = await timelockContract.getUserDepositCount(userAddress);

// Get total locked amount
const totalLocked = await timelockContract.getTotalLockedAmount(userAddress);

// Get available withdrawal amount
const available = await timelockContract.getAvailableWithdrawalAmount(userAddress);
```

## Contract Functions

### User Functions

- `deposit(uint256 amount, uint256 lockDuration, address beneficiary)` - Deposit USDC
- `withdraw(uint256 depositId)` - Withdraw unlocked deposit
- `forwardDeposit(uint256 depositId, address to)` - Forward unlocked deposit to another address

### View Functions

- `getDeposit(address user, uint256 depositId)` - Get deposit information
- `getUserDepositCount(address user)` - Get user's deposit count
- `getTotalLockedAmount(address user)` - Get total locked amount
- `getAvailableWithdrawalAmount(address user)` - Get available withdrawal amount
- `isDepositUnlocked(address user, uint256 depositId)` - Check if deposit is unlocked
- `getValidLockDurations()` - Get all valid lock durations

### Admin Functions

- `rescueTokens(address token, uint256 amount, address to)` - Rescue accidentally sent tokens
- `pause()` - Pause the contract
- `unpause()` - Unpause the contract

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **SafeERC20**: Safe token transfers using OpenZeppelin
- **Ownable**: Admin functions restricted to owner
- **Pausable**: Contract can be paused in emergencies
- **Input Validation**: Comprehensive checks for all inputs
- **Custom Errors**: Gas-efficient error handling

## Events

- `DepositCreated` - Emitted when a deposit is created
- `DepositWithdrawn` - Emitted when a deposit is withdrawn
- `TokensRescued` - Emitted when tokens are rescued by admin

## Error Handling

The contract uses custom errors for gas efficiency:

- `InvalidLockDuration()` - Invalid lock duration provided
- `DepositNotFound()` - Deposit does not exist
- `DepositAlreadyWithdrawn()` - Deposit already withdrawn
- `DepositNotUnlocked()` - Deposit not yet unlocked
- `InsufficientBalance()` - Insufficient token balance
- `ZeroAmount()` - Zero amount provided
- `ZeroAddress()` - Zero address provided
- `InvalidDepositId()` - Invalid deposit ID

## Network Support

The contract is designed to work on any EVM-compatible network. USDC addresses are pre-configured for major networks:

- **Base Mainnet**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` ⭐ **Primary Target**
- **Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Testnet)
- **Ethereum Mainnet**: Update with actual USDC address
- **Polygon**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **Arbitrum**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- **Optimism**: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- **Goerli**: `0x07865c6E87B9F70255377e024ace6630C1Eaa37F`
- **Sepolia**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`

## Foundry Commands

```bash
# Build the project
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run specific test with verbose output
forge test --match-test testValidDeposit -vvv

# Format code
forge fmt

# Generate gas snapshots
forge snapshot

# Start local node
anvil

# Deploy script
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast

# Verify contract
forge verify-contract <CONTRACT_ADDRESS> src/TimelockPiggyBank.sol:TimelockPiggyBank --etherscan-api-key <API_KEY>
```

## License

MIT