'use client';

import { PiggyBank, Github, ExternalLink } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '@/lib/contracts';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-2.5 rounded-2xl shadow-lg">
                <PiggyBank className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AssetStrategy
              </h1>
              <p className="text-xs text-gray-500 font-medium">Smart Crypto Vault</p>
            </div>
          </div>

          {/* Right side - Links & Connect Button */}
          <div className="flex items-center gap-4">
            {/* Links */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Contract</span>
              </a>
              <a
                href="https://github.com/isaac-richie/piggybank"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </div>

            {/* Connect Button */}
            <div className="connect-button-wrapper">
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
