'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PiggyBank, Coins } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-2 rounded-xl shadow-lg">
              <PiggyBank className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Piggylock
              </h1>
              <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                Smart Crypto Savings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
              <Coins className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">ETH • USDC • WBTC</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
