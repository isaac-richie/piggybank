'use client';

import { useState } from 'react';
import { isAddress, type Address } from 'viem';
import { AlertCircle, ArrowDownToLine, CheckCircle2, Loader2, Lock, Plus, Send, Unlock, X } from 'lucide-react';
import { explorerTxUrl, useIsWrongNetwork, useVaultActions, useVaultStatus, useWalletBalances, type Lock as LockData } from '@/hooks/useContract';
import { useNow } from '@/hooks/useNow';
import { assetById } from '@/lib/assets';
import { cn, formatAmount, formatShortDate, sanitizeAmountInput, tryParseAmount } from '@/lib/utils';
import { getTxErrorMessage } from '@/lib/tx-errors';
import { toast } from '@/hooks/use-toast';
import { AssetIcon } from '@/components/AssetIcon';
import { Skeleton } from '@/components/ui/skeleton';

type Filter = 'open' | 'ready' | 'closed';
type Status = 'locked' | 'ready' | 'closed';

const statusOf = (lock: LockData, now: number): Status =>
  lock.isWithdrawn ? 'closed' : now >= lock.unlockTime ? 'ready' : 'locked';

export function MyDeposits({ locks, isLoading }: { locks: LockData[]; isLoading: boolean }) {
  const now = useNow();
  const [filter, setFilter] = useState<Filter>('open');

  const counts = {
    open: locks.filter((l) => !l.isWithdrawn).length,
    ready: locks.filter((l) => statusOf(l, now) === 'ready').length,
    closed: locks.filter((l) => l.isWithdrawn).length,
  };

  const visible = locks.filter((l) => {
    const status = statusOf(l, now);
    if (filter === 'open') return status !== 'closed';
    return status === filter;
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: 'open', label: 'Open' },
    { id: 'ready', label: 'Ready' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Your locks</h2>
        <div role="tablist" className="inline-flex rounded-xl bg-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
                filter === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span className="ml-1.5 tabular text-muted-foreground">{counts[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState filter={filter} hasAny={locks.length > 0} />
      ) : (
        <div className="space-y-3">
          {visible.map((lock) => (
            <LockCard key={lock.id} lock={lock} now={now} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ filter, hasAny }: { filter: Filter; hasAny: boolean }) {
  const copy = {
    open: hasAny
      ? { title: 'No open locks', body: 'Everything has been withdrawn. Start a new lock whenever you’re ready.' }
      : { title: 'No locks yet', body: 'Create your first lock and it will show up here with a live countdown.' },
    ready: { title: 'Nothing ready yet', body: 'Locks appear here once their unlock date passes.' },
    closed: { title: 'No closed locks', body: 'Withdrawn and settled locks will be listed here.' },
  }[filter];

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold">{copy.title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy.body}</p>
    </div>
  );
}

function formatCountdown(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.max(1, Math.floor((seconds % 3600) / 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function LockCard({ lock, now }: { lock: LockData; now: number }) {
  const asset = assetById(Number(lock.assetType));
  const status = statusOf(lock, now);
  const months = Math.round(Number(lock.lockDuration) / 86400 / 30);
  const start = Number(lock.depositTime);
  const progress = Math.min(100, Math.max(0, ((now - start) / Number(lock.lockDuration)) * 100));

  const { topUp, withdraw, forward, pending, isBusy } = useVaultActions();
  const { isPaused } = useVaultStatus();
  const wrongNetwork = useIsWrongNetwork();
  const balances = useWalletBalances();

  const [panel, setPanel] = useState<'topup' | 'forward' | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const blocked = isBusy || isPaused || wrongNetwork;
  const parsedTopUp = tryParseAmount(topUpAmount, asset.decimals);
  const balance = balances[asset.symbol];
  const topUpTooBig = parsedTopUp !== null && balance !== undefined && parsedTopUp > balance;
  const forwardValid = isAddress(forwardTo);
  const isPendingKey = (key: string) => pending?.key === `${key}-${lock.id}`;

  const togglePanel = (next: 'topup' | 'forward') => {
    setError(null);
    setPanel((current) => (current === next ? null : next));
  };

  const runAction = async (action: () => Promise<string>, title: string, onDone?: () => void) => {
    setError(null);
    try {
      const hash = await action();
      toast({
        title,
        description: (
          <a className="font-semibold underline" href={explorerTxUrl(hash)} target="_blank" rel="noopener noreferrer">
            View transaction
          </a>
        ),
      });
      onDone?.();
    } catch (err) {
      console.error(`${title} failed:`, err);
      setError(getTxErrorMessage(err));
    }
  };

  const amountText = formatAmount(lock.amount, asset.decimals, asset.displayDecimals);

  return (
    <article
      className={cn(
        'rounded-3xl border bg-card p-5 shadow-card transition sm:p-6',
        status === 'ready' ? 'border-success/40 ring-1 ring-success/20' : 'border-border',
        status === 'closed' && 'bg-card/60'
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AssetIcon asset={asset} className="h-10 w-10" />
          <div className="min-w-0">
            <p className={cn('truncate font-display text-2xl font-bold tabular leading-tight', status === 'closed' && 'text-muted-foreground')}>
              {amountText} <span className="text-base font-semibold text-muted-foreground">{asset.symbol}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Lock #{lock.id} · {months}-month · started {formatShortDate(start)}
            </p>
          </div>
        </div>
        <StatusPill status={status} />
      </header>

      {status !== 'closed' && (
        <div className="mt-5">
          <div
            className="h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lock progress"
          >
            <div
              className={cn('h-full rounded-full transition-[width] duration-700', status === 'ready' ? 'bg-success' : 'bg-ink')}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="font-medium tabular">
              {status === 'ready' ? 'Unlocked — ready to withdraw' : formatCountdown(lock.unlockTime - now)}
            </span>
            <span className="text-muted-foreground">
              {status === 'ready' ? 'since' : 'unlocks'} {formatShortDate(lock.unlockTime)}
            </span>
          </div>
        </div>
      )}

      {status === 'closed' && (
        <p className="mt-3 text-xs text-muted-foreground">Closed · was due {formatShortDate(lock.unlockTime)}</p>
      )}

      {status === 'locked' && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => togglePanel('topup')}
            disabled={blocked && panel !== 'topup'}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition disabled:opacity-50 sm:w-auto sm:px-5',
              panel === 'topup' ? 'border-foreground bg-foreground/[0.03]' : 'border-border hover:border-foreground/40'
            )}
          >
            {panel === 'topup' ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {panel === 'topup' ? 'Cancel' : 'Top up'}
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={() => runAction(() => withdraw(lock.id), 'Withdrawn to your wallet')}
            disabled={blocked}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-success text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
          >
            {isPendingKey('withdraw') ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
            {isPendingKey('withdraw') ? 'Withdrawing…' : `Withdraw ${amountText} ${asset.symbol}`}
          </button>
          <button
            type="button"
            onClick={() => togglePanel('forward')}
            disabled={blocked && panel !== 'forward'}
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition disabled:opacity-50',
              panel === 'forward' ? 'border-foreground bg-foreground/[0.03]' : 'border-border hover:border-foreground/40'
            )}
          >
            {panel === 'forward' ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {panel === 'forward' ? 'Cancel' : 'Send elsewhere'}
          </button>
        </div>
      )}

      {panel === 'topup' && status === 'locked' && (
        <div className="mt-3 rounded-2xl bg-secondary p-3 sm:p-4">
          <label htmlFor={`topup-${lock.id}`} className="text-xs font-semibold">
            Add {asset.symbol} to this lock
            {balance !== undefined && (
              <span className="ml-1 font-normal text-muted-foreground">
                · balance {formatAmount(balance, asset.decimals, asset.displayDecimals)}
              </span>
            )}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className={cn('flex h-12 items-center rounded-xl border bg-card px-3 sm:flex-1', topUpTooBig ? 'border-destructive' : 'border-input')}>
              <input
                id={`topup-${lock.id}`}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(sanitizeAmountInput(e.target.value, asset.decimals))}
                className="w-0 min-w-0 flex-1 bg-transparent font-display text-lg font-semibold tabular outline-none"
              />
              <span className="text-sm font-semibold text-muted-foreground">{asset.symbol}</span>
            </div>
            <button
              type="button"
              disabled={blocked || !parsedTopUp || topUpTooBig}
              onClick={() =>
                parsedTopUp &&
                runAction(() => topUp(asset.symbol, lock.id, parsedTopUp), `Added ${topUpAmount} ${asset.symbol}`, () => {
                  setTopUpAmount('');
                  setPanel(null);
                })
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {isPendingKey('topup') && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPendingKey('topup')
                ? pending?.step === 'approve'
                  ? `Approving ${asset.symbol}…`
                  : 'Adding…'
                : topUpTooBig
                  ? `Not enough ${asset.symbol}`
                  : 'Add to lock'}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Top-ups keep the original unlock date of {formatShortDate(lock.unlockTime)}.</p>
        </div>
      )}

      {panel === 'forward' && status === 'ready' && (
        <div className="mt-3 rounded-2xl bg-secondary p-3 sm:p-4">
          <label htmlFor={`forward-${lock.id}`} className="text-xs font-semibold">
            Destination address
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={`forward-${lock.id}`}
              autoComplete="off"
              spellCheck={false}
              placeholder="0x…"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value.trim())}
              className={cn(
                'h-12 w-full min-w-0 rounded-xl sm:flex-1 border bg-card px-3 font-mono text-sm outline-none',
                forwardTo && !forwardValid ? 'border-destructive' : 'border-input'
              )}
            />
            <button
              type="button"
              disabled={blocked || !forwardValid}
              onClick={() =>
                runAction(() => forward(lock.id, forwardTo as Address), 'Funds sent', () => {
                  setForwardTo('');
                  setPanel(null);
                })
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {isPendingKey('forward') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isPendingKey('forward') ? 'Sending…' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {forwardTo && !forwardValid
              ? 'That doesn’t look like a valid address.'
              : `Sends the full ${amountText} ${asset.symbol}. Double-check the address — this can’t be undone.`}
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-2xl bg-destructive-soft p-3.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </article>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles = {
    locked: { label: 'Locked', icon: Lock, className: 'bg-secondary text-foreground' },
    ready: { label: 'Ready', icon: Unlock, className: 'bg-success-soft text-success' },
    closed: { label: 'Closed', icon: CheckCircle2, className: 'bg-secondary text-muted-foreground' },
  }[status];

  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', styles.className)}>
      <styles.icon className="h-3.5 w-3.5" />
      {styles.label}
    </span>
  );
}
