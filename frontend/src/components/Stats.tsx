'use client';

import { useTimelockPiggyBank } from '@/hooks/useContract';
import { DollarSign, PiggyBank, TrendingUp } from 'lucide-react';

export function Stats() {
  const { 
    depositCount,
    activeDepositCount, 
    totalLockedUSDC,
    totalLockedETH, 
    contractUSDCBalance, 
    contractETHBalance 
  } = useTimelockPiggyBank();

  console.log('Stats data:', { depositCount, activeDepositCount, totalLockedUSDC, totalLockedETH, contractUSDCBalance, contractETHBalance });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Deposits</p>
            <p className="text-2xl font-bold text-gray-900">{activeDepositCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total: {depositCount}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <PiggyBank className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Your USDC Locked</p>
            <p className="text-2xl font-bold text-gray-900">
              {parseFloat(totalLockedUSDC).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Your ETH Locked</p>
            <p className="text-2xl font-bold text-gray-900">
              {parseFloat(totalLockedETH).toFixed(4)}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total in Contract</p>
            <p className="text-lg font-bold text-gray-900">
              {parseFloat(contractUSDCBalance).toLocaleString()} USDC
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {parseFloat(contractETHBalance).toFixed(4)} ETH
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
