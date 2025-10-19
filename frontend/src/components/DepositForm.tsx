'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractWrite, useUSDC, useWBTC } from '@/hooks/useContract';
import { LOCK_DURATIONS, type LockDuration } from '@/lib/contracts';
import { parseUSDC, parseETH, parseWBTC } from '@/lib/utils';
import { DollarSign, Coins, Clock } from 'lucide-react';

export function DepositForm() {
  const { address } = useAccount();
  const { balance: usdcBalance, allowance: usdcAllowance, refetchAll: refetchUSDC } = useUSDC();
  const { balance: wbtcBalance, allowance: wbtcAllowance, refetchAll: refetchWBTC } = useWBTC();
  const { 
    depositUSDC, 
    depositETH, 
    depositWBTC,
    approveUSDC, 
    approveWBTC,
    isPending, 
    isConfirming,
    isSuccess 
  } = useContractWrite();

  const [depositType, setDepositType] = useState<'USDC' | 'ETH' | 'WBTC'>('USDC');
  const [amount, setAmount] = useState('');
  const [lockDuration, setLockDuration] = useState<LockDuration>('3 months');
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Show success message only after transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      setSuccess(`${depositType} deposit successful! Transaction confirmed.`);
      // Refetch balances and allowances
      refetchUSDC();
      refetchWBTC();
      // Reset form
      setAmount('');
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, depositType, refetchUSDC, refetchWBTC]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !address) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const duration = LOCK_DURATIONS[lockDuration];
      
      if (depositType === 'USDC') {
        const amountBigInt = parseUSDC(amount);
        const allowanceBigInt = parseUSDC(usdcAllowance);
        
        console.log('USDC Deposit:', { amount, amountBigInt, allowanceBigInt, duration });
        
        if (amountBigInt > allowanceBigInt) {
          console.log('Approving USDC...');
          setIsApproving(true);
          await approveUSDC(amount);
          setIsApproving(false);
          console.log('USDC approved, now depositing...');
        }
        
        await depositUSDC(amount, BigInt(duration));
        // Success will be shown by useEffect when isSuccess becomes true
      } else if (depositType === 'WBTC') {
        const amountBigInt = parseWBTC(amount);
        const allowanceBigInt = parseWBTC(wbtcAllowance);
        
        console.log('WBTC Deposit:', { amount, amountBigInt, allowanceBigInt, duration });
        
        if (amountBigInt > allowanceBigInt) {
          console.log('Approving WBTC...');
          setIsApproving(true);
          await approveWBTC(amount);
          setIsApproving(false);
          console.log('WBTC approved, now depositing...');
        }
        
        await depositWBTC(amount, BigInt(duration));
        // Success will be shown by useEffect when isSuccess becomes true
      } else {
        const amountBigInt = parseETH(amount);
        console.log('ETH Deposit:', { amount, amountBigInt, duration });
        await depositETH(BigInt(duration), amountBigInt);
        // Success will be shown by useEffect when isSuccess becomes true
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      setError(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const needsApproval = 
    (depositType === 'USDC' && amount && parseUSDC(amount) > parseUSDC(usdcAllowance)) ||
    (depositType === 'WBTC' && amount && parseWBTC(amount) > parseWBTC(wbtcAllowance));

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
          <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Make a Deposit</h2>
      </div>

      <form onSubmit={handleDeposit} className="space-y-4 md:space-y-6">
        {/* Deposit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
            Deposit Type
          </label>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setDepositType('USDC')}
              className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                depositType === 'USDC'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-xs sm:text-sm md:text-base">USDC</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDepositType('WBTC')}
              className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                depositType === 'WBTC'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-xs sm:text-sm md:text-base">WBTC</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDepositType('ETH')}
              className={`p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all ${
                depositType === 'ETH'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-xs sm:text-sm md:text-base">ETH</span>
              </div>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({depositType})
          </label>
          <div className="space-y-2">
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${depositType} amount`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="text-right text-sm text-gray-500">
              Balance: {depositType === 'USDC' ? usdcBalance : depositType === 'WBTC' ? wbtcBalance : 'ETH'}
            </div>
          </div>
        </div>

        {/* Lock Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lock Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(LOCK_DURATIONS).map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setLockDuration(duration as LockDuration)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  lockDuration === duration
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isConfirming || isApproving}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isApproving ? (
            'Approving...'
          ) : isPending ? (
            'Confirming...'
          ) : isConfirming ? (
            'Processing...'
          ) : needsApproval ? (
            'Approve & Deposit'
          ) : (
            `Deposit ${depositType}`
          )}
        </button>
      </form>
    </div>
  );
}
