'use client';

import { useState, useEffect } from 'react';
import { useTimelockPiggyBank, useDeposit, useContractWrite } from '@/hooks/useContract';
import { formatUSDC, formatETH, formatDateTime, getTimeRemaining, isDepositUnlocked } from '@/lib/utils';
import { Clock, DollarSign, ArrowRight, CheckCircle, Lock } from 'lucide-react';

export function MyDeposits() {
  const { depositCount, refetchAll: refetchContract } = useTimelockPiggyBank();
  const { withdraw, forwardDeposit, isPending, isSuccess } = useContractWrite();
  const [forwardingTo, setForwardingTo] = useState<{ [key: number]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Show success message only after transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      setSuccess('Transaction successful! Funds have been transferred.');
      // Refetch all contract data
      refetchContract();
      // Trigger refresh of all deposit cards
      setRefreshKey(prev => prev + 1);
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchContract]);

  const handleWithdraw = async (depositId: number) => {
    setError(null);
    setSuccess(null);
    try {
      await withdraw(depositId);
      // Success will be shown by useEffect when isSuccess becomes true
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleForward = async (depositId: number) => {
    const to = forwardingTo[depositId];
    if (!to) return;
    
    setError(null);
    setSuccess(null);
    try {
      await forwardDeposit(depositId, to);
      setForwardingTo({ ...forwardingTo, [depositId]: '' });
      // Success will be shown by useEffect when isSuccess becomes true
    } catch (error) {
      console.error('Forward failed:', error);
      setError(`Forward failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (depositCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Deposits Yet
          </h3>
          <p className="text-gray-600">
            Make your first deposit to get started with time-locked savings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-xl">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">My Deposits</h2>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: depositCount }, (_, i) => (
          <DepositCard
            key={`${i}-${refreshKey}`}
            depositId={i}
            onWithdraw={handleWithdraw}
            onForward={handleForward}
            forwardingTo={forwardingTo[i] || ''}
            setForwardingTo={(to) => setForwardingTo({ ...forwardingTo, [i]: to })}
            isPending={isPending}
            refreshKey={refreshKey}
          />
        ))}
      </div>
    </div>
  );
}

function DepositCard({ 
  depositId, 
  onWithdraw, 
  onForward, 
  forwardingTo, 
  setForwardingTo, 
  isPending,
  refreshKey 
}: {
  depositId: number;
  onWithdraw: (id: number) => void;
  onForward: (id: number) => void;
  forwardingTo: string;
  setForwardingTo: (to: string) => void;
  isPending: boolean;
  refreshKey: number;
}) {
  const { deposit, isLoading, error, refetch } = useDeposit(depositId);

  // Refetch when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-xl p-6 bg-red-50">
        <p className="text-red-700">Error loading deposit #{depositId}: {error.message}</p>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="border border-gray-200 rounded-xl p-6">
        <p className="text-gray-500">Deposit #{depositId} not found</p>
      </div>
    );
  }

  const { amount, lockDuration, depositTime, isWithdrawn, assetType } = deposit;
  const unlocked = isDepositUnlocked(depositTime, lockDuration);
  const timeRemaining = getTimeRemaining(depositTime, lockDuration);

  // Determine asset type
  const isETH = Number(assetType) === 1;
  const isWBTC = Number(assetType) === 2;

  // Get asset name and colors
  const assetName = isETH ? 'ETH' : isWBTC ? 'WBTC' : 'USDC';
  const bgColor = isETH ? 'bg-orange-100' : isWBTC ? 'bg-purple-100' : 'bg-blue-100';
  const textColor = isETH ? 'text-orange-600' : isWBTC ? 'text-purple-600' : 'text-blue-600';

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <DollarSign className={`h-5 w-5 ${textColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {assetName} Deposit #{depositId}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDateTime(depositTime)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isWithdrawn ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Withdrawn
            </span>
          ) : unlocked ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready to Withdraw
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Amount</p>
        <p className="text-2xl font-bold text-gray-900">
          {isETH ? formatETH(amount) : isWBTC ? (Number(amount) / 1e8).toFixed(8) : formatUSDC(amount)} {assetName}
        </p>
      </div>

      {!isWithdrawn && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Time Remaining</p>
          <p className="font-semibold text-gray-900">{timeRemaining}</p>
        </div>
      )}

      {!isWithdrawn && unlocked && (
        <div className="space-y-3">
          <button
            onClick={() => onWithdraw(depositId)}
            disabled={isPending}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Withdraw
          </button>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={forwardingTo}
              onChange={(e) => setForwardingTo(e.target.value)}
              placeholder="Forward to address..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => onForward(depositId)}
              disabled={isPending || !forwardingTo}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
