'use client';

import { useState, useEffect } from 'react';
import { useTimelockPiggyBank, useUSDC, useWBTC, useContractWrite } from '@/hooks/useContract';
import { LOCK_DURATIONS, type LockDuration } from '@/lib/contracts';
import { Coins, Clock, TrendingUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export function DepositForm() {
  const { refetchAll: refetchContract } = useTimelockPiggyBank();
  const { balance: usdcBalance, refetchAll: refetchUSDC } = useUSDC();
  const { balance: wbtcBalance, refetchAll: refetchWBTC } = useWBTC();
  const {
    depositUSDC,
    depositETH,
    depositWBTC,
    approveUSDC,
    approveWBTC,
    isPending,
    isSuccess,
  } = useContractWrite();

  const [depositType, setDepositType] = useState<'USDC' | 'ETH' | 'WBTC'>('USDC');
  const [amount, setAmount] = useState('');
  const [lockDuration, setLockDuration] = useState<LockDuration>('3 mins');
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Show success message only after transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      setSuccess('Deposit successful! Your funds are now locked.');
      setAmount('');
      refetchContract();
      refetchUSDC();
      refetchWBTC();
      setTimeout(() => setSuccess(null), 5000);
    }
  }, [isSuccess, refetchContract, refetchUSDC, refetchWBTC]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const lockDurationSeconds = BigInt(LOCK_DURATIONS[lockDuration]);

      if (depositType === 'USDC') {
        setIsApproving(true);
        await approveUSDC(amount);
        setIsApproving(false);
        await depositUSDC(amount, lockDurationSeconds);
      } else if (depositType === 'ETH') {
        const value = BigInt(Math.floor(parseFloat(amount) * 1e18));
        await depositETH(lockDurationSeconds, value);
      } else if (depositType === 'WBTC') {
        setIsApproving(true);
        await approveWBTC(amount);
        setIsApproving(false);
        await depositWBTC(amount, lockDurationSeconds);
      }
    } catch (err) {
      setIsApproving(false);
      console.error('Deposit failed:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed. Please try again.');
    }
  };

  const assetInfo = {
    USDC: { icon: <Coins className="h-5 w-5" />, balance: usdcBalance, color: 'blue', decimals: 6 },
    ETH: { icon: <TrendingUp className="h-5 w-5" />, balance: 'N/A', color: 'orange', decimals: 18 },
    WBTC: { icon: <Coins className="h-5 w-5" />, balance: wbtcBalance, color: 'purple', decimals: 8 },
  };

  const currentAsset = assetInfo[depositType];

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create Deposit
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{lockDuration}</span>
          </div>
        </div>
        <CardDescription>
          Lock your crypto and commit to your savings goals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Asset Selection Tabs */}
        <Tabs value={depositType} onValueChange={(v) => setDepositType(v as typeof depositType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="USDC" className="gap-2">
              <Coins className="h-4 w-4" />
              USDC
            </TabsTrigger>
            <TabsTrigger value="ETH" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              ETH
            </TabsTrigger>
            <TabsTrigger value="WBTC" className="gap-2">
              <Coins className="h-4 w-4" />
              WBTC
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={depositType === 'ETH' ? '0.01' : depositType === 'WBTC' ? '0.00000001' : '0.01'}
              className="text-lg h-12 pr-20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {depositType}
              </Badge>
            </div>
          </div>
          {currentAsset.balance !== 'N/A' && (
            <p className="text-xs text-gray-500">
              Balance: <span className="font-medium">{currentAsset.balance} {depositType}</span>
            </p>
          )}
        </div>

        {/* Lock Duration Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Lock Duration</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(LOCK_DURATIONS) as LockDuration[]).map((duration) => (
              <Button
                key={duration}
                variant={lockDuration === duration ? 'default' : 'outline'}
                onClick={() => setLockDuration(duration)}
                className={lockDuration === duration ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}
              >
                {duration}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={isPending || isApproving || !amount}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
        >
          {isApproving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Approving {depositType}...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Lock ${amount || '0'} ${depositType}`
          )}
        </Button>

        {/* Info Note */}
        <div className="text-xs text-center text-gray-500 bg-gray-100 rounded-lg p-3">
          💡 Funds will be locked for the selected duration. You can top up anytime!
        </div>
      </CardContent>
    </Card>
  );
}
