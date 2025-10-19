#!/bin/bash

echo "🚀 Setting up Timelock Piggy Bank Frontend"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found. Please run this script from the project root."
    exit 1
fi

cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp env.local.example .env.local
    echo "✅ Created .env.local file"
    echo "📝 Please edit .env.local and add your WalletConnect Project ID"
else
    echo "✅ .env.local already exists"
fi

echo "🏗️ Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "🌐 Then open http://localhost:3000 in your browser"
echo ""
echo "📝 Don't forget to:"
echo "   1. Get a WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "   2. Add it to frontend/.env.local"
echo "   3. Connect your wallet to Base Sepolia network"
echo "   4. Get some Base Sepolia ETH from the faucet"
