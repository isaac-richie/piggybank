# 🔐 Secure Deployment Guide

## ⚠️ **CRITICAL SECURITY WARNINGS**

- **NEVER** commit private keys to version control
- **NEVER** share your private key with anyone
- **NEVER** use your main wallet's private key for deployments
- **ALWAYS** use a dedicated deployment wallet
- **ALWAYS** verify your .env file is in .gitignore

## 🛡️ **Security Best Practices**

### **1. Use a Dedicated Deployment Wallet**
```bash
# Create a new wallet specifically for deployments
# Fund it with only the minimum required ETH
# Keep the private key secure and separate from your main wallet
```

### **2. Environment Variables (Recommended)**
```bash
# Copy the example file
cp env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor

# Verify .env is in .gitignore
grep -q "\.env" .gitignore && echo "✅ .env is in .gitignore" || echo "❌ Add .env to .gitignore"
```

### **3. Hardware Wallet (Most Secure)**
```bash
# Use a hardware wallet like Ledger or Trezor
# Never expose your private key in plain text
# Use the --interactive flag for secure input
```

## 🚀 **Deployment Methods**

### **Method 1: Environment File (Recommended)**
```bash
# 1. Set up .env file
cp env.example .env
# Edit .env with your private key

# 2. Load environment and deploy
source .env
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

# 3. Clear environment after deployment
unset PRIVATE_KEY
```

### **Method 2: Interactive Input (Most Secure)**
```bash
# Foundry will prompt for private key securely
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify --interactive
```

### **Method 3: Temporary Environment Variable**
```bash
# Set temporarily (clears when terminal closes)
export PRIVATE_KEY=your_private_key_here
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify
unset PRIVATE_KEY  # Clear after use
```

## 🔍 **Pre-Deployment Checklist**

- [ ] Private key is secure and not exposed
- [ ] Using dedicated deployment wallet
- [ ] Have Base Sepolia ETH for gas fees
- [ ] .env file is in .gitignore
- [ ] Contract is tested and ready
- [ ] Have Basescan API key (optional, for verification)

## 📋 **Deployment Steps**

### **Step 1: Get Base Sepolia ETH**
1. Go to [Base Bridge](https://bridge.base.org/deposit)
2. Bridge some ETH from Ethereum to Base Sepolia
3. Or use [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### **Step 2: Set Up Environment**
```bash
# Copy example file
cp env.example .env

# Edit with your values
nano .env
```

### **Step 3: Deploy**
```bash
# Load environment
source .env

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

# Clear environment
unset PRIVATE_KEY
```

## 🚨 **Emergency Procedures**

### **If Private Key is Compromised**
1. **Immediately** transfer all funds from the compromised wallet
2. **Never** use that private key again
3. **Create** a new wallet for future deployments
4. **Update** all environment files

### **If .env is Accidentally Committed**
1. **Immediately** remove from git history
2. **Change** the private key
3. **Add** .env to .gitignore
4. **Force push** to remove from remote

## 🔒 **Additional Security Tips**

- Use a password manager to store private keys
- Enable 2FA on all accounts
- Use different wallets for different purposes
- Regularly rotate private keys
- Monitor wallet activity
- Use hardware wallets for large amounts
- Consider multisig for production contracts

## 📞 **Support**

If you have security concerns:
- Check your .gitignore file
- Verify no private keys in git history
- Use `git log --all --full-history -- .env` to check
- Consider using `git-secrets` for additional protection

---

**Remember: Security is your responsibility. When in doubt, ask for help!** 🛡️
