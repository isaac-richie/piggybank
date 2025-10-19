# Base Mainnet Deployment Checklist

## ✅ Configuration Updates Completed

### Smart Contract Configuration
- ✅ USDC Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Circle USDC on Base)
- ✅ WBTC Address: `0x0555e30da8f98308edb960aa94c0db47230d2b9c` (WBTC on Base)
- ✅ Deploy script supports Base mainnet
- ✅ Network configuration in foundry.toml

### Frontend Configuration
- ✅ Network: Base Mainnet (Chain ID: 8453)
- ✅ USDC Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- ✅ WBTC Address: `0x0555e30da8f98308edb960aa94c0db47230d2b9c`
- ✅ RPC URL: `https://mainnet.base.org`
- ✅ Block Explorer: `https://basescan.org`

### Deployment Scripts
- ✅ Updated `deploy.sh` with mainnet support
- ✅ Added safety prompts for mainnet deployment
- ✅ Environment variable configuration

## 📋 Pre-Deployment Checklist

### 1. Security Audit
- [ ] Contract code reviewed by security experts
- [ ] All tests passing (`forge test`)
- [ ] Gas optimization reviewed
- [ ] Emergency procedures documented

### 2. Testing
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Security tests passing
- [ ] Testnet deployment successful (if applicable)
- [ ] Frontend tested with testnet contract

### 3. Wallet & Keys
- [ ] Deployment wallet funded with ETH for gas
- [ ] Private key stored securely (hardware wallet recommended)
- [ ] Multisig setup for contract ownership (recommended)
- [ ] Backup recovery phrases secured

### 4. Documentation
- [ ] Contract addresses documented
- [ ] ABI files exported and backed up
- [ ] User documentation prepared
- [ ] Admin procedures documented

### 5. Monitoring & Operations
- [ ] Block explorer verification planned
- [ ] Transaction monitoring setup
- [ ] Alert system configured
- [ ] Incident response plan ready

## 🚀 Deployment Steps

### Step 1: Environment Setup
```bash
# Copy and configure environment file
cp env.example .env
nano .env  # Add your private key and API keys
```

### Step 2: Final Testing
```bash
# Run all tests
forge test

# Run security tests
forge test --match-path test/SecurityTest.t.sol -vvv

# Check gas costs
forge test --gas-report
```

### Step 3: Build Contract
```bash
# Clean build
forge clean
forge build

# Verify compilation
ls -la out/TimelockPiggyBank.sol/
```

### Step 4: Deploy to Mainnet
```bash
# Use the deployment script (includes safety checks)
./deploy.sh

# Select option 1 for Base Mainnet
# Confirm the deployment when prompted

# Or deploy manually:
forge script script/Deploy.s.sol \
  --rpc-url base \
  --broadcast \
  --verify \
  --legacy
```

### Step 5: Verify Deployment
```bash
# Check contract on BaseScan
# https://basescan.org/address/[CONTRACT_ADDRESS]

# Verify contract is initialized correctly
cast call [CONTRACT_ADDRESS] "owner()" --rpc-url base
cast call [CONTRACT_ADDRESS] "usdcToken()" --rpc-url base
cast call [CONTRACT_ADDRESS] "wbtcToken()" --rpc-url base
```

### Step 6: Update Frontend
```bash
cd frontend

# Update contract address in src/lib/contracts.ts
# Update CONTRACT_ADDRESS with deployed address

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to hosting platform
```

## 🔐 Post-Deployment Security

### Immediate Actions
1. **Verify Contract on BaseScan**
   - Ensure source code is verified
   - Check contract is marked as verified ✓

2. **Test Basic Functionality**
   - Small test deposit from trusted wallet
   - Verify deposit shows correctly
   - Test withdrawal after timelock

3. **Set Up Monitoring**
   - Monitor contract transactions
   - Set up alerts for large transactions
   - Monitor gas prices and contract balance

### Ownership & Admin
```bash
# Transfer ownership to multisig (recommended)
cast send [CONTRACT_ADDRESS] \
  "transferOwnership(address)" \
  [MULTISIG_ADDRESS] \
  --rpc-url base \
  --private-key [DEPLOYER_KEY]

# Verify new owner
cast call [CONTRACT_ADDRESS] "owner()" --rpc-url base
```

## 📊 Contract Addresses

### Base Mainnet Deployment
- **TimelockPiggyBank**: `0xBa71207D0e8d7605FA6e001972C3c8B464Bd5F5B`
- **USDC Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **WBTC Token**: `0x0555E30da8f98308EdB960aa94C0Db47230d2B9c`
- **Deployer Address**: `0xe2063Ba953eE37d5E3156B599A71Eb6A571D407B`
- **Contract Owner**: `0xe2063Ba953eE37d5E3156B599A71Eb6A571D407B`
- **Deployment Date**: `October 19, 2025`
- **Verification**: ✅ Verified on Sourcify

## 🛡️ Emergency Procedures

### In Case of Issues

1. **Pause Contract** (if issue detected)
   ```bash
   cast send [CONTRACT_ADDRESS] "pause()" \
     --rpc-url base \
     --private-key [OWNER_KEY]
   ```

2. **Contact Users**
   - Prepare announcement
   - Post on social media
   - Update website status

3. **Assess Situation**
   - Review transaction history
   - Check for exploits
   - Consult security experts

4. **Rescue Funds** (if needed and safe)
   ```bash
   cast send [CONTRACT_ADDRESS] \
     "rescueTokens(address,uint256,address)" \
     [TOKEN_ADDRESS] [AMOUNT] [SAFE_ADDRESS] \
     --rpc-url base \
     --private-key [OWNER_KEY]
   ```

## 📞 Contact Information

- **Developer**: [YOUR_CONTACT]
- **Security Team**: [SECURITY_CONTACT]
- **Emergency Contact**: [EMERGENCY_CONTACT]

## 🔗 Important Links

- **BaseScan**: https://basescan.org
- **Base Docs**: https://docs.base.org
- **Contract Repo**: [YOUR_REPO_URL]
- **Frontend URL**: [YOUR_FRONTEND_URL]

## ⚠️ Important Notes

1. **Mainnet deployment is IRREVERSIBLE**
2. **Always use a dedicated deployment wallet**
3. **Never commit private keys to Git**
4. **Test thoroughly on testnet first**
5. **Have emergency procedures ready**
6. **Consider using a multisig for ownership**
7. **Keep deployment details documented**
8. **Monitor contract continuously after deployment**

---

**Last Updated**: October 19, 2025
**Status**: Ready for Mainnet Deployment ✅

