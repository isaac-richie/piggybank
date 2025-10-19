#!/bin/bash

# Secure deployment script for Timelock Piggy Bank
# This script helps you deploy securely to Base Sepolia

set -e  # Exit on any error

echo "🚀 Timelock Piggy Bank - Secure Deployment Script"
echo "=================================================="

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

# Deploy to Base Sepolia
echo "🚀 Deploying to Base Sepolia..."
echo "⚠️  This will use your private key. Make sure you're using a dedicated deployment wallet!"

read -p "🤔 Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy with verification
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

echo "✅ Deployment completed!"
echo "🔍 Check your contract on Base Sepolia Explorer:"
echo "   https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]"

# Clear environment variables
echo "🧹 Clearing environment variables..."
unset PRIVATE_KEY
unset BASESCAN_API_KEY

echo "🎉 Deployment script completed successfully!"
