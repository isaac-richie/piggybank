'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { useIsWrongNetwork, useVaultActions, useVaultStatus, useWalletBalances, explorerTxUrl } from '@/hooks/useContract';
import { ASSETS, ASSET_LIST, type AssetSymbol } from '@/lib/assets';
import { LOCK_DURATIONS, type LockDuration } from '@/lib/contracts';
import { cn, formatAmount, formatShortDate, sanitizeAmountInput, tryParseAmount } from '@/lib/utils';
import { getTxErrorMessage } from '@/lib/tx-errors';
import { toast } from '@/hooks/use-toast';
import { AssetIcon } from '@/components/AssetIcon';

const DURATIONS = Object.keys(LOCK_DURATIONS) as LockDuration[];

export function DepositForm({ onCreated }: { onCreated?: () => void }) {
  const balances = useWalletBalances();
  const { deposit, pending, isBusy } = useVaultActions();
  const { isPaused } = useVaultStatus();
  const wrongNetwork = useIsWrongNetwork();

  const [symbol, setSymbol] = useState<AssetSymbol>('USDC');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState<LockDuration>('3 months');
  const [error, setError] = useState<string | null>(null);

  const asset = ASSETS[symbol];
  const balance = balances[symbol];
  const parsed = tryParseAmount(amount, asset.decimals);
  const insufficient = parsed !== null && balance !== undefined && parsed > balance;
  const unlockAt = Date.now() / 1000 + LOCK_DURATIONS[duration];

  const selectAsset = (next: AssetSymbol) => {
    setSymbol(next);
    setAmount('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    setError(null);
    try {
      const hash = await deposit(symbol, parsed, BigInt(LOCK_DURATIONS[duration]));
      toast({
        title: 'Lock created',
        description: (
          <span>
            {amount} {symbol} locked until {formatShortDate(unlockAt)}.{' '}
            <a className="font-semibold underline" href={explorerTxUrl(hash)} target="_blank" rel="noopener noreferrer">
              View transaction
            </a>
          </span>
        ),
      });
      setAmount('');
      onCreated?.();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(getTxErrorMessage(err, 'Could not create the lock. Please try again.'));
    }
  };

  const submitLabel = (() => {
    if (pending?.key === 'deposit') {
      return pending.step === 'approve' ? `Approving ${symbol}…` : 'Locking…';
    }
    if (wrongNetwork) return 'Switch network to continue';
    if (isPaused) return 'Vault paused';
    if (!amount) return 'Enter an amount';
    if (!parsed) return 'Enter a valid amount';
    if (insufficient) return `Not enough ${symbol}`;
    return `Lock ${amount} ${symbol}`;
  })();

  const disabled = isBusy || wrongNetwork || isPaused || !parsed || insufficient;

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="font-display text-xl font-bold">New lock</h2>

      {/* Asset */}
      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold">Asset</legend>
        <div className="grid grid-cols-3 gap-2">
          {ASSET_LIST.map((a) => {
            const active = a.symbol === symbol;
            const bal = balances[a.symbol];
            return (
              <button
                key={a.symbol}
                type="button"
                onClick={() => selectAsset(a.symbol)}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition sm:flex-row sm:text-left',
                  active ? 'border-foreground bg-foreground/[0.03] ring-1 ring-foreground' : 'border-border hover:border-foreground/40'
                )}
              >
                <AssetIcon asset={a} className="h-8 w-8 text-sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.symbol}</span>
                  <span className="block truncate text-[11px] text-muted-foreground tabular">
                    {bal === undefined ? '—' : formatAmount(bal, a.decimals, Math.min(a.displayDecimals, 4))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Amount */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="amount" className="text-sm font-semibold">
            Amount
          </label>
          {balance !== undefined && (
            <span className="text-xs text-muted-foreground">
              Balance{' '}
              <span className="font-medium text-foreground tabular">
                {formatAmount(balance, asset.decimals, asset.displayDecimals)} {symbol}
              </span>
            </span>
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-2xl border bg-background px-4 transition focus-within:ring-2 focus-within:ring-ring/20',
            insufficient ? 'border-destructive' : 'border-input focus-within:border-foreground'
          )}
        >
          <input
            id="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(sanitizeAmountInput(e.target.value, asset.decimals))}
            className="h-16 w-0 min-w-0 flex-1 bg-transparent font-display text-3xl font-semibold tabular outline-none placeholder:text-muted-foreground/50"
          />
          {/* ETH max is left out on purpose: the wallet needs some ETH for gas. */}
          {symbol !== 'ETH' && balance !== undefined && balance > 0n && (
            <button
              type="button"
              onClick={() => setAmount(formatAmount(balance, asset.decimals, asset.decimals).replace(/,/g, ''))}
              className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-accent"
            >
              Max
            </button>
          )}
          <span className="text-sm font-semibold text-muted-foreground">{symbol}</span>
        </div>
      </div>

      {/* Duration */}
      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold">Lock for</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {DURATIONS.map((d) => {
            const active = d === duration;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                aria-pressed={active}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-left transition',
                  active ? 'border-ink bg-ink text-white' : 'border-border hover:border-foreground/40'
                )}
              >
                <span className="block font-display text-lg font-bold leading-tight">{d.replace('months', 'mo')}</span>
                <span className={cn('block text-[11px]', active ? 'text-white/60' : 'text-muted-foreground')}>
                  until {formatShortDate(Date.now() / 1000 + LOCK_DURATIONS[d])}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Summary */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {parsed ? (
            <>
              <span className="font-semibold">
                {amount} {symbol}
              </span>{' '}
              will be locked until <span className="font-semibold">{formatShortDate(unlockAt)}</span>.
            </>
          ) : (
            <>Funds stay locked until <span className="font-semibold">{formatShortDate(unlockAt)}</span>.</>
          )}{' '}
          You can add more before then, but can’t withdraw early.
          {symbol !== 'ETH' && ' First-time locks ask you to approve the token, then confirm.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-2xl bg-destructive-soft p-3.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/30"
      >
        {pending?.key === 'deposit' && <Loader2 className="h-5 w-5 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
