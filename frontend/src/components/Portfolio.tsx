'use client';

import { ASSET_LIST, type AssetSymbol } from '@/lib/assets';
import { formatAmount } from '@/lib/utils';
import { AssetIcon } from '@/components/AssetIcon';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  locked: Record<AssetSymbol, bigint>;
  activeCount: number;
  readyCount: number;
  nextUnlock: number | null;
  isLoading: boolean;
};

export function Portfolio({ locked, activeCount, readyCount, nextUnlock, isLoading }: Props) {
  const daysToNext = nextUnlock ? Math.max(0, Math.ceil((nextUnlock - Date.now() / 1000) / 86400)) : null;

  return (
    <section className="overflow-hidden rounded-3xl bg-ink text-white shadow-lift">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Your vault</p>
          <div className="mt-3 flex items-end gap-3">
            {isLoading ? (
              <Skeleton className="h-12 w-16 bg-white/10" />
            ) : (
              <p className="font-display text-5xl font-bold leading-none tabular">{activeCount}</p>
            )}
            <p className="pb-1 text-sm text-white/60">{activeCount === 1 ? 'open lock' : 'open locks'}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            {readyCount > 0 && (
              <span className="rounded-full bg-brand px-2.5 py-1 text-brand-foreground">
                {readyCount} ready to withdraw
              </span>
            )}
            {daysToNext !== null && (
              <span className="rounded-full bg-white/10 px-2.5 py-1">
                Next unlock {daysToNext === 0 ? 'today' : `in ${daysToNext} day${daysToNext === 1 ? '' : 's'}`}
              </span>
            )}
            {activeCount === 0 && !isLoading && (
              <span className="rounded-full bg-white/10 px-2.5 py-1">Create your first lock to get started</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ASSET_LIST.map((asset) => (
            <div key={asset.symbol} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 sm:block sm:p-4">
              <AssetIcon asset={asset} className="h-8 w-8 text-sm ring-white/10" />
              <div className="min-w-0 flex-1 sm:mt-3">
                <p className="text-xs text-white/50">Locked {asset.symbol}</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-6 w-20 bg-white/10" />
                ) : (
                  <p className="truncate font-display text-xl font-semibold tabular">
                    {formatAmount(locked[asset.symbol], asset.decimals, asset.displayDecimals)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
