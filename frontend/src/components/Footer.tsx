'use client';

import { PiggyBank, Github, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS } from '@/lib/contracts';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-2 rounded-xl shadow-md">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Piggylock</h3>
              <p className="text-xs text-gray-500">Disciplined Crypto Savings</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/isaac-richie/piggybank"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Contract</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center md:text-right">
            <p>© {new Date().getFullYear()} Piggylock</p>
            <p className="text-gray-400">Built on Base</p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-6 pt-6 border-t text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-gray-500">
            <span className="font-medium">Base Mainnet Contract:</span>
            <a 
              href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

