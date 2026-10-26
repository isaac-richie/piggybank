#!/bin/bash

# Secure deployment script for Timelock Piggy Bank
# This script helps you deploy securely to Base Mainnet or Base Sepolia

set -e  # Exit on any error

echo "🚀 Timelock Piggy Bank - Secure Deployment Script"
echo "=================================================="

# Ask for network selection
echo "Select deployment network:"
echo "1) Base Mainnet (Production)"
echo "2) Base Sepolia (Testnet)"
read -p "Enter your choice (1 or 2): " NETWORK_CHOICE

if [ "$NETWORK_CHOICE" = "1" ]; then
    NETWORK="base"
    NETWORK_NAME="Base Mainnet"
    RPC_URL="base"
    EXPLORER_URL="https://basescan.org"
    export NETWORK="base"
elif [ "$NETWORK_CHOICE" = "2" ]; then
    NETWORK="base-sepolia"
    NETWORK_NAME="Base Sepolia"
    RPC_URL="base-sepolia"
    EXPLORER_URL="https://sepolia.basescan.org"
    export NETWORK="base-sepolia"
else
    echo "❌ Invalid choice!"
    exit 1
fi

echo "📍 Selected network: $NETWORK_NAME"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file first:"
    echo "   cp env.example .env"
    echo "   nano .env  # Edit with your private key"
    exit 1
fi

# Load environment variables
echo "📁 Loading environment variables..."
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file!"
    echo "📝 Please add your private key to .env file"
    exit 1
fi

echo "✅ Environment loaded successfully"

# Check if we have enough ETH (optional check)
echo "💰 Checking wallet balance..."
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "📍 Wallet address: $WALLET_ADDRESS"

# Build the project
echo "🔨 Building project..."
forge build

# Run tests
echo "🧪 Running tests..."
forge test

# Deploy to selected network
echo "🚀 Deploying to $NETWORK_NAME..."
echo "⚠️  This will use your private key. Make sure you're using a dedicated deployment wallet!"

if [ "$NETWORK" = "base" ]; then
    echo "⚠️  WARNING: You are deploying to MAINNET!"
    echo "⚠️  This will use REAL funds and is irreversible!"
    echo "   Owner after deploy: ${OWNER:-deployer wallet}"
    read -p "🤔 Are you ABSOLUTELY SURE you want to deploy to MAINNET? (yes/N): " -r
    echo
    if [[ ! $REPLY = "yes" ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    read -p "🤔 Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Deploy with verification
echo "📝 Deploying contract..."
VERIFY_FLAGS=()
if [ -n "$BASESCAN_API_KEY" ]; then
    VERIFY_FLAGS=(--verify --etherscan-api-key "$BASESCAN_API_KEY")
else
    echo "⚠️  BASESCAN_API_KEY not set - skipping source verification"
fi
forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast "${VERIFY_FLAGS[@]}"

echo "✅ Deployment completed!"
echo "🔍 Check your contract on $NETWORK_NAME Explorer:"
echo "   $EXPLORER_URL/address/[CONTRACT_ADDRESS]"

# Clear environment variables
echo "🧹 Clearing environment variables..."
unset PRIVATE_KEY
unset BASESCAN_API_KEY

echo "🎉 Deployment script completed successfully!"
