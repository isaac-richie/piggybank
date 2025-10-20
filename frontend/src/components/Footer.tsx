'use client';

import { PiggyBank, Github, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '@/lib/contracts';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">AssetStrategy</h3>
                <p className="text-xs text-indigo-300">Smart Crypto Vault</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Build wealth through disciplined crypto savings. Lock your assets with smart contract security on Base Sepolia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-indigo-300">Resources</h4>
            <div className="space-y-2">
              <a
                href="https://github.com/isaac-richie/piggybank"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Contract</span>
              </a>
              <a
                href="https://docs.base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Base Documentation</span>
              </a>
            </div>
          </div>

          {/* Contract Info */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-indigo-300">Contract Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Network</p>
                <p className="font-mono text-gray-300">{NETWORK_CONFIG.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Address</p>
                <a
                  href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                >
                  {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {currentYear} AssetStrategy. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built with <span className="text-red-400">❤️</span> on Base
          </p>
        </div>
      </div>
    </footer>
  );
}
