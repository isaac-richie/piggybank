'use client';

import { Lock, DollarSign, Clock, Shield, Zap, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <div className="text-center py-8 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Main Brand Section */}
        <div className="mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="h-4 w-4" />
            <span>Live on Base Mainnet</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Build Wealth with
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Disciplined Savings
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            Lock your crypto and commit to your financial goals. Deposit <span className="font-semibold text-gray-900">ETH, USDC, or WBTC</span> for 3-12 months — helping you save with purpose and avoid impulsive spending.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Audited Smart Contracts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Non-Custodial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Multi-Asset</span>
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 md:p-6 border border-blue-100 hover:border-blue-200 transition-all hover:shadow-lg">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              💎 Self-Discipline Tool
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Lock your crypto to prevent impulsive trading. Build the habit of long-term holding and watch your wealth grow.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 md:p-6 border border-purple-100 hover:border-purple-200 transition-all hover:shadow-lg">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              🪙 Multi-Asset Vault
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Diversify your savings with ETH, USDC, and WBTC. All secured in one trusted smart contract on Base.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-5 md:p-6 border border-pink-100 hover:border-pink-200 transition-all hover:shadow-lg">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ⏰ Your Terms, Your Way
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Choose 3, 6, 9, or 12-month locks. Perfect for saving for goals, markets cycles, or major purchases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
