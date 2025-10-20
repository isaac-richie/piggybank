'use client';

import { useState, useEffect } from 'react';
import { useTimelockPiggyBank, useDeposit, useUSDC, useWBTC, useContractWrite } from '@/hooks/useContract';
import { formatUSDC, formatETH, formatDateTime, getTimeRemaining, isDepositUnlocked } from '@/lib/utils';
import { Clock, DollarSign, Send, Plus, Loader2, CheckCircle2, Lock, Unlock, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type DepositData = {
  amount: bigint;
  lockDuration: bigint;
  depositTime: bigint;
  isWithdrawn: boolean;
  assetType: number;
};

export function MyDeposits() {
  const { depositCount, refetchAll: refetchContract } = useTimelockPiggyBank();
  const { refetchAll: refetchUSDC } = useUSDC();
  const { refetchAll: refetchWBTC } = useWBTC();
  const {
    withdraw,
    forwardDeposit,
    topUpUSDC,
    topUpETH,
    topUpWBTC,
    approveUSDC,
    approveWBTC,
    isPending,
    isSuccess,
  } = useContractWrite();
  const [forwardingTo, setForwardingTo] = useState<{ [key: number]: string }>({});
  const [topUpAmounts, setTopUpAmounts] = useState<{ [key: number]: string }>({});
  const [showTopUp, setShowTopUp] = useState<{ [key: number]: boolean }>({});
  const [showForward, setShowForward] = useState<{ [key: number]: boolean }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isSuccess) {
      setSuccess('Transaction successful!');
      refetchContract();
      refetchUSDC();
      refetchWBTC();
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setSuccess(null), 5000);
    }
  }, [isSuccess, refetchContract, refetchUSDC, refetchWBTC]);

  const handleWithdraw = async (depositId: number) => {
    setError(null);
    setSuccess(null);
    try {
      await withdraw(depositId);
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
      setShowForward({ ...showForward, [depositId]: false });
    } catch (error) {
      console.error('Forward failed:', error);
      setError(`Forward failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTopUp = async (depositId: number, assetType: number) => {
    const amount = topUpAmounts[depositId];
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount to top up');
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      if (assetType === 0) {
        await approveUSDC(amount);
        await topUpUSDC(depositId, amount);
      } else if (assetType === 1) {
        const value = BigInt(Math.floor(parseFloat(amount) * 1e18));
        await topUpETH(depositId, value);
      } else if (assetType === 2) {
        await approveWBTC(amount);
        await topUpWBTC(depositId, amount);
      }
      setTopUpAmounts({ ...topUpAmounts, [depositId]: '' });
      setShowTopUp({ ...showTopUp, [depositId]: false });
    } catch (error) {
      console.error('Top up failed:', error);
      setError(`Top up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (depositCount === 0) {
    return (
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Deposits Yet</h3>
            <p className="text-gray-600">Make your first deposit above to start your savings journey!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Clock className="h-7 w-7" />
            My Savings
          </CardTitle>
          <CardDescription className="text-indigo-100">
            {depositCount} {depositCount === 1 ? 'deposit' : 'deposits'} · Manage your time-locked assets
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Deposits Grid */}
      <div className="grid gap-4">
        {Array.from({ length: depositCount }, (_, i) => (
          <DepositCard
            key={`${i}-${refreshKey}`}
            depositId={i}
            onWithdraw={handleWithdraw}
            onForward={handleForward}
            onTopUp={handleTopUp}
            forwardingTo={forwardingTo[i] || ''}
            setForwardingTo={(to) => setForwardingTo({ ...forwardingTo, [i]: to })}
            topUpAmount={topUpAmounts[i] || ''}
            setTopUpAmount={(amount) => setTopUpAmounts({ ...topUpAmounts, [i]: amount })}
            showTopUp={showTopUp[i] || false}
            setShowTopUp={(show) => setShowTopUp({ ...showTopUp, [i]: show })}
            showForward={showForward[i] || false}
            setShowForward={(show) => setShowForward({ ...showForward, [i]: show })}
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
  onTopUp,
  forwardingTo,
  setForwardingTo,
  topUpAmount,
  setTopUpAmount,
  showTopUp,
  setShowTopUp,
  showForward,
  setShowForward,
  isPending,
  refreshKey,
}: {
  depositId: number;
  onWithdraw: (id: number) => void;
  onForward: (id: number) => void;
  onTopUp: (id: number, assetType: number) => void;
  forwardingTo: string;
  setForwardingTo: (to: string) => void;
  topUpAmount: string;
  setTopUpAmount: (amount: string) => void;
  showTopUp: boolean;
  setShowTopUp: (show: boolean) => void;
  showForward: boolean;
  setShowForward: (show: boolean) => void;
  isPending: boolean;
  refreshKey: number;
}) {
  const { deposit, isLoading, error, refetch } = useDeposit(depositId);

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6">
          <p className="text-red-700 text-center">Error loading deposit #{depositId}</p>
        </CardContent>
      </Card>
    );
  }

  if (!deposit) {
    return null;
  }

  const depositData = deposit as unknown as DepositData;

  if (!depositData.amount || depositData.amount === 0n) {
    return null;
  }

  const amount = depositData.amount;
  const lockDuration = depositData.lockDuration;
  const depositTime = depositData.depositTime;
  const isWithdrawn = depositData.isWithdrawn;
  const assetType = depositData.assetType;

  const unlocked = isDepositUnlocked(depositTime, lockDuration);
  const timeRemaining = getTimeRemaining(depositTime, lockDuration);

  const isETH = Number(assetType) === 1;
  const isWBTC = Number(assetType) === 2;

  const assetName = isETH ? 'ETH' : isWBTC ? 'WBTC' : 'USDC';
  const assetColor = isETH ? 'orange' : isWBTC ? 'purple' : 'blue';

  const gradients = {
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all overflow-hidden border-0">
      {/* Gradient Top Border */}
      <div className={`h-1.5 bg-gradient-to-r ${gradients[assetColor]}`}></div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[assetColor]} shadow-lg`}>
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{assetName} Deposit #{depositId}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {formatDateTime(depositTime)}
              </CardDescription>
            </div>
          </div>

          {/* Status Badge */}
          {isWithdrawn ? (
            <Badge variant="secondary" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Withdrawn
            </Badge>
          ) : unlocked ? (
            <Badge className="gap-1.5 bg-green-500 hover:bg-green-600 animate-pulse">
              <Unlock className="h-3.5 w-3.5" />
              Ready
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-3xl font-black text-gray-900">
            {isETH ? formatETH(amount) : isWBTC ? (Number(amount) / 1e8).toFixed(8) : formatUSDC(amount)}
            <span className="text-xl font-semibold text-gray-500 ml-2">{assetName}</span>
          </p>
        </div>

        {/* Time Info */}
        {!isWithdrawn && (
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {unlocked ? (
                <span className="text-green-600 font-semibold">Unlocked! Withdraw anytime</span>
              ) : (
                <>Unlocks in <span className="font-semibold text-gray-900">{timeRemaining}</span></>
              )}
            </span>
          </div>
        )}

        <Separator />

        {/* Actions */}
        {!isWithdrawn && (
          <div className="space-y-3">
            {/* Top Up Section */}
            {!showTopUp ? (
              <Button
                onClick={() => setShowTopUp(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Top Up Deposit
              </Button>
            ) : (
              <div className="space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-purple-900">Add More {assetName}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTopUp(false);
                      setTopUpAmount('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder={`Amount in ${assetName}`}
                  step={isETH ? "0.01" : isWBTC ? "0.00000001" : "0.01"}
                />
                <Button
                  onClick={() => onTopUp(depositId, Number(assetType))}
                  disabled={isPending || !topUpAmount || parseFloat(topUpAmount) <= 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Add {topUpAmount || '0'} {assetName}</>
                  )}
                </Button>
              </div>
            )}

            {/* Withdraw or Forward Section */}
            {unlocked && (
              <>
                <Button
                  onClick={() => onWithdraw(depositId)}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Withdraw to Wallet
                    </>
                  )}
                </Button>

                {/* Forward Option */}
                {!showForward ? (
                  <Button
                    onClick={() => setShowForward(true)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send to Another Address
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-blue-900">Forward Address</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowForward(false);
                          setForwardingTo('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      type="text"
                      value={forwardingTo}
                      onChange={(e) => setForwardingTo(e.target.value)}
                      placeholder="0x..."
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => onForward(depositId)}
                      disabled={isPending || !forwardingTo}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Forward Funds
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
