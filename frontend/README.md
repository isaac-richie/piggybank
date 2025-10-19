# 🏦 Timelock Piggy Bank Frontend

A modern, responsive web application for the Timelock Piggy Bank smart contract built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- 🔗 **Wallet Connection** - Connect with MetaMask, WalletConnect, and more
- 💰 **Dual Asset Support** - Deposit USDC and ETH
- ⏰ **Flexible Lock Periods** - 3, 6, 9, or 12 months
- 📊 **Real-time Stats** - View your deposits and contract statistics
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔒 **Secure** - Built with Web3 best practices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Wallet with Base Sepolia ETH

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` and add your WalletConnect Project ID:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   ```

3. **Get a WalletConnect Project ID:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID to your `.env.local` file

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── providers.tsx   # Web3 providers
│   ├── components/         # React components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Stats.tsx       # Statistics display
│   │   ├── DepositForm.tsx # Deposit form
│   │   └── MyDeposits.tsx  # User deposits
│   ├── hooks/              # Custom React hooks
│   │   └── useContract.ts  # Contract interaction hooks
│   └── lib/                # Utilities and configuration
│       ├── contracts.ts    # Contract ABI and addresses
│       ├── web3.ts         # Web3 configuration
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
└── package.json           # Dependencies
```

## 🔧 Configuration

### Contract Addresses

The contract addresses are configured in `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = "0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519";
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
```

### Network Configuration

The app is configured for Base Sepolia testnet. To change networks, update the configuration in `src/lib/web3.ts`.

## 🎨 UI Components

### Header
- Logo and branding
- Wallet connection button
- Security indicators

### Hero Section
- Main value proposition
- Feature highlights
- Call-to-action

### Stats Dashboard
- User deposit count
- Total locked amounts
- Contract balances

### Deposit Form
- Asset selection (USDC/ETH)
- Amount input
- Lock duration selection
- Beneficiary address
- Automatic USDC approval

### My Deposits
- List of user deposits
- Deposit status (locked/unlocked/withdrawn)
- Withdrawal and forwarding actions
- Time remaining display

## 🔌 Web3 Integration

### RainbowKit
- Multi-wallet support
- Beautiful connection UI
- Network switching

### Wagmi
- React hooks for Ethereum
- Type-safe contract interactions
- Automatic transaction management

### Viem
- Lightweight Ethereum library
- TypeScript support
- Optimized for modern apps

## 🧪 Testing

The frontend integrates with the deployed smart contract on Base Sepolia. Make sure you have:

1. **Base Sepolia ETH** for gas fees
2. **USDC on Base Sepolia** for testing USDC deposits
3. **Wallet connected** to Base Sepolia network

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add frontend"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📱 Mobile Support

The frontend is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔒 Security Features

- **Wallet Integration** - No private keys stored
- **Input Validation** - All inputs validated
- **Error Handling** - Comprehensive error handling
- **Transaction Confirmation** - Clear transaction states
- **Network Validation** - Ensures correct network

## 🎯 Usage

1. **Connect Wallet** - Click the connect button
2. **Choose Asset** - Select USDC or ETH
3. **Enter Amount** - Specify deposit amount
4. **Select Duration** - Choose lock period
5. **Set Beneficiary** - Who can withdraw
6. **Deposit** - Confirm transaction
7. **Monitor** - View your deposits
8. **Withdraw** - When unlocked

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Timelock Piggy Bank project**