'use client';

import { AlertTriangle, PauseCircle } from 'lucide-react';
import { useSwitchChain } from 'wagmi';
import { NETWORK_CONFIG } from '@/lib/contracts';
import { useIsWrongNetwork, useVaultStatus } from '@/hooks/useContract';

export function StatusBanner() {
  const wrongNetwork = useIsWrongNetwork();
  const { isPaused } = useVaultStatus();
  const { switchChain, isPending } = useSwitchChain();

  if (wrongNetwork) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold">Wrong network</p>
            <p className="text-sm text-muted-foreground">Switch your wallet to {NETWORK_CONFIG.name} to see and manage your locks.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => switchChain({ chainId: NETWORK_CONFIG.chainId })}
          disabled={isPending}
          className="h-10 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? 'Switching…' : `Switch to ${NETWORK_CONFIG.name}`}
        </button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-semibold">The vault is temporarily paused</p>
          <p className="text-sm text-muted-foreground">New locks, top-ups and withdrawals are on hold. Your balances are safe and shown below.</p>
        </div>
      </div>
    );
  }

  return null;
}
