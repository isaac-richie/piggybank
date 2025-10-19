# 🚀 Base Chain Deployment Guide

## Timelock Piggy Bank on Base

This guide will walk you through deploying the Timelock Piggy Bank contract on Base chain.

## 📋 Prerequisites

1. **Foundry installed** - [Install Foundry](https://book.getfoundry.sh/getting-started/installation)
2. **Base RPC access** - Use Base's public RPC or get an API key
3. **Base Sepolia ETH** - For testnet deployment (get from [Base Faucet](https://bridge.base.org/deposit))
4. **Base ETH** - For mainnet deployment
5. **Private key** - Your wallet's private key for deployment

## 🔧 Configuration

### Base Network Details
- **Base Mainnet**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)
- **Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (USDC)
- **Chain ID**: 8453 (Mainnet), 84532 (Sepolia)
- **RPC URL**: `https://mainnet.base.org` (Mainnet), `https://sepolia.base.org` (Sepolia)

## 🚀 Deployment Steps

### 1. Environment Setup

Create a `.env` file:
```bash
# Required
PRIVATE_KEY=your_private_key_here

# Optional - for verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 2. Test Deployment (Base Sepolia)

```bash
# Deploy to Base Sepolia testnet
NETWORK=base-sepolia forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

# Or with explicit RPC URL
NETWORK=base-sepolia forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify
```

### 3. Mainnet Deployment (Base)

```bash
# Deploy to Base mainnet
NETWORK=base forge script script/Deploy.s.sol --rpc-url base --broadcast --verify

# Or with explicit RPC URL
NETWORK=base forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast --verify
```

## 📊 Expected Output

```
Deploying to network: base
Using USDC address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
TimelockPiggyBank deployed to: 0x[CONTRACT_ADDRESS]
Verifying deployment...
Contract owner: 0x[YOUR_ADDRESS]
USDC token address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Valid lock durations:
  1. 7776000 seconds (3 months)
  2. 15552000 seconds (6 months)
  3. 23328000 seconds (9 months)
  4. 31536000 seconds (12 months)

Deployment completed successfully!
```

## 🔍 Verification

### Automatic Verification
The deployment script includes automatic verification. If you have a Basescan API key:

```bash
export BASESCAN_API_KEY=your_api_key_here
NETWORK=base forge script script/Deploy.s.sol --rpc-url base --broadcast --verify
```

### Manual Verification
If automatic verification fails, verify manually:

```bash
forge verify-contract <CONTRACT_ADDRESS> src/TimelockPiggyBank.sol:TimelockPiggyBank --etherscan-api-key <BASESCAN_API_KEY> --chain-id 8453
```

## 💰 Gas Costs

### Estimated Gas Costs (Base)
- **Contract Deployment**: ~1,032,593 gas
- **Deposit**: ~150,000-200,000 gas
- **Withdrawal**: ~100,000-150,000 gas
- **Forward Deposit**: ~100,000-150,000 gas

### Base Gas Prices
- **Current**: ~0.001 gwei (very low!)
- **Cost per transaction**: ~$0.01-0.05

## 🧪 Testing on Base Sepolia

### 1. Get Test USDC
- Bridge USDC from Ethereum to Base Sepolia
- Or use Base Sepolia testnet faucet

### 2. Test the Contract
```javascript
// Example interaction
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Approve USDC spending
await usdcContract.approve(CONTRACT_ADDRESS, ethers.parseUnits("100", 6));

// Deposit 100 USDC for 3 months
await contract.deposit(
  ethers.parseUnits("100", 6), 
  7776000, // 3 months in seconds
  userAddress
);
```

## 🔗 Contract Interaction

### Frontend Integration
```javascript
// Contract ABI (from out/TimelockPiggyBank.sol/TimelockPiggyBank.json)
import TimelockPiggyBankABI from './TimelockPiggyBank.json';

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  TimelockPiggyBankABI.abi,
  signer
);
```

### Key Functions
```javascript
// Deposit USDC
await contract.deposit(amount, lockDuration, beneficiary);

// Withdraw after unlock
await contract.withdraw(depositId);

// Forward to another address
await contract.forwardDeposit(depositId, recipientAddress);

// Check if deposit is unlocked
const isUnlocked = await contract.isDepositUnlocked(userAddress, depositId);
```

## 📱 Base Ecosystem Integration

### Wallets Supporting Base
- **Coinbase Wallet** (Native)
- **MetaMask** (with Base network)
- **WalletConnect** compatible wallets
- **Rainbow Wallet**

### Base Network Configuration
```javascript
const baseNetwork = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};
```

## 🛡️ Security Considerations

### Base-Specific Security
- **Low gas costs** - More affordable for complex operations
- **EVM compatibility** - Same security model as Ethereum
- **Coinbase backing** - Enterprise-grade infrastructure
- **Optimistic rollup** - Inherits Ethereum's security

### Best Practices
1. **Test thoroughly** on Base Sepolia first
2. **Verify contract** on Basescan
3. **Monitor gas prices** (though Base is very cheap)
4. **Use proper error handling** in frontend
5. **Implement proper access controls**

## 📈 Monitoring & Analytics

### Basescan Explorer
- **Mainnet**: https://basescan.org
- **Sepolia**: https://sepolia.basescan.org
- **Contract verification**: Automatic with deployment script

### Key Metrics to Monitor
- **Total deposits** by duration
- **Active users** count
- **Withdrawal patterns**
- **Gas usage** optimization

## 🚨 Troubleshooting

### Common Issues

#### 1. Insufficient Gas
```bash
# Increase gas limit
forge script script/Deploy.s.sol --rpc-url base --broadcast --gas-limit 2000000
```

#### 2. Verification Failed
```bash
# Verify manually with constructor arguments
forge verify-contract <ADDRESS> src/TimelockPiggyBank.sol:TimelockPiggyBank --constructor-args $(cast abi-encode "constructor(address)" 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
```

#### 3. RPC Connection Issues
```bash
# Use alternative RPC
forge script script/Deploy.s.sol --rpc-url https://base-mainnet.g.alchemy.com/v2/YOUR_KEY --broadcast
```

## 🎯 Next Steps

1. **Deploy to Base Sepolia** for testing
2. **Test all functionality** thoroughly
3. **Deploy to Base mainnet** when ready
4. **Build frontend** integration
5. **Monitor and maintain** the contract

## 📞 Support

- **Base Documentation**: https://docs.base.org
- **Foundry Documentation**: https://book.getfoundry.sh
- **Contract Issues**: Check the test suite for examples

---

**Ready to deploy on Base? Let's go! 🚀**
