'use client';

import { useTimelockPiggyBank } from '@/hooks/useContract';
import { DollarSign, PiggyBank, TrendingUp, Coins } from 'lucide-react';

export function Stats() {
  const { 
    depositCount,
    activeDepositCount, 
    totalLockedUSDC,
    totalLockedETH,
    totalLockedWBTC,
    contractUSDCBalance, 
    contractETHBalance,
    contractWBTCBalance
  } = useTimelockPiggyBank();

  console.log('Stats data:', { depositCount, activeDepositCount, totalLockedUSDC, totalLockedETH, totalLockedWBTC, contractUSDCBalance, contractETHBalance, contractWBTCBalance });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Active Deposits */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <PiggyBank className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-medium text-gray-600">Deposits</p>
        </div>
        <p className="text-xl font-bold text-gray-900">{activeDepositCount}</p>
        <p className="text-xs text-gray-500">of {depositCount} total</p>
      </div>
      
      {/* USDC Locked */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <p className="text-xs font-medium text-gray-600">USDC</p>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {parseFloat(totalLockedUSDC).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">locked</p>
      </div>
      
      {/* ETH Locked */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          <p className="text-xs font-medium text-gray-600">ETH</p>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {parseFloat(totalLockedETH).toFixed(4)}
        </p>
        <p className="text-xs text-gray-500">locked</p>
      </div>

      {/* WBTC Locked */}
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="h-4 w-4 text-orange-600" />
          <p className="text-xs font-medium text-gray-600">WBTC</p>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {parseFloat(totalLockedWBTC).toFixed(8)}
        </p>
        <p className="text-xs text-gray-500">locked</p>
      </div>
      
      {/* Total in Contract */}
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-4 border border-indigo-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <p className="text-xs font-medium text-gray-600">TVL</p>
        </div>
        <p className="text-sm font-bold text-gray-900">
          {parseFloat(contractUSDCBalance).toLocaleString()} USDC
        </p>
        <p className="text-xs text-gray-600">
          {parseFloat(contractETHBalance).toFixed(4)} ETH
        </p>
        <p className="text-xs text-gray-600">
          {parseFloat(contractWBTCBalance).toFixed(6)} WBTC
        </p>
      </div>
    </div>
  );
}
