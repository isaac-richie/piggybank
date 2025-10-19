'use client';

import { useTimelockPiggyBank } from '@/hooks/useContract';
import { DollarSign, PiggyBank, TrendingUp } from 'lucide-react';

export function Stats() {
  const { 
    depositCount, 
    totalLockedUSDC, 
    contractUSDCBalance, 
    contractETHBalance 
  } = useTimelockPiggyBank();

  console.log('Stats data:', { depositCount, totalLockedUSDC, contractUSDCBalance, contractETHBalance });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Your Deposits</p>
            <p className="text-2xl font-bold text-gray-900">{depositCount}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <PiggyBank className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Locked (USDC)</p>
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
            <p className="text-sm font-medium text-gray-600">Contract USDC</p>
            <p className="text-2xl font-bold text-gray-900">
              {parseFloat(contractUSDCBalance).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Contract ETH</p>
            <p className="text-2xl font-bold text-gray-900">
              {parseFloat(contractETHBalance).toFixed(4)}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
