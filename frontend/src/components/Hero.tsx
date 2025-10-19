'use client';

import { ArrowRight, Lock, DollarSign, Clock } from 'lucide-react';

export function Hero() {
  return (
    <div className="text-center py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Secure Your Future with
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {' '}Time-Locked Savings
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Deposit USDC or ETH for 3, 6, 9, or 12 months and earn peace of mind 
          knowing your funds are safely locked until maturity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure & Safe
            </h3>
            <p className="text-gray-600">
              Your funds are protected by smart contracts and can only be withdrawn after the lock period.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multiple Assets
            </h3>
            <p className="text-gray-600">
              Support for both USDC and ETH deposits with flexible lock durations.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Flexible Terms
            </h3>
            <p className="text-gray-600">
              Choose from 3, 6, 9, or 12-month lock periods to match your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
