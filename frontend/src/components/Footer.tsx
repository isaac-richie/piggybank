'use client';

import { PiggyBank, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Timelock Piggy Bank</h3>
              <p className="text-sm text-gray-600">Secure time-locked savings on Base</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Timelock Piggy Bank. All rights reserved.</p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">
            Contract: <span className="font-mono">0x3F2f48b30FbF9b23E5f44c5a8aF99Cf7802c15a6</span> • Base Sepolia
          </p>
        </div>
      </div>
    </footer>
  );
}

