'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Layers, PlusCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { DepositForm } from '@/components/DepositForm';
import { MyDeposits } from '@/components/MyDeposits';
import { Portfolio } from '@/components/Portfolio';
import { StatusBanner } from '@/components/StatusBanner';
import { Footer } from '@/components/Footer';
import { useLocks, usePortfolio } from '@/hooks/useContract';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';

type MobileView = 'new' | 'locks';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{isConnected ? <Dashboard /> : <Hero />}</main>
      <Footer />
    </div>
  );
}

function Dashboard() {
  const portfolio = usePortfolio();
  const { locks, isLoading: locksLoading } = useLocks(portfolio.depositCount);
  const now = useNow();
  const [view, setView] = useState<MobileView | null>(null);

  const open = locks.filter((l) => !l.isWithdrawn);
  const readyCount = open.filter((l) => now >= l.unlockTime).length;
  const upcoming = open.filter((l) => now < l.unlockTime).map((l) => l.unlockTime);
  const nextUnlock = upcoming.length ? Math.min(...upcoming) : null;

  // Until the user picks a tab, new savers land on the form and everyone else on their locks.
  const mobileView: MobileView = view ?? (portfolio.depositCount === 0 && !portfolio.isLoading ? 'new' : 'locks');

  return (
    <div className="container space-y-6 pb-32 pt-6 sm:pt-8 lg:pb-16">
      <StatusBanner />

      <Portfolio
        locked={portfolio.locked}
        activeCount={portfolio.activeCount}
        readyCount={readyCount}
        nextUnlock={nextUnlock}
        isLoading={portfolio.isLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className={cn('min-w-0 lg:col-span-5 lg:block', mobileView === 'new' ? 'block' : 'hidden')}>
          <div className="lg:sticky lg:top-24">
            <DepositForm onCreated={() => setView('locks')} />
          </div>
        </div>
        <div className={cn('min-w-0 lg:col-span-7 lg:block', mobileView === 'locks' ? 'block' : 'hidden')}>
          <MyDeposits locks={locks} isLoading={portfolio.isLoading || locksLoading} />
        </div>
      </div>

      <MobileNav view={mobileView} onChange={setView} readyCount={readyCount} />
    </div>
  );
}

function MobileNav({ view, onChange, readyCount }: { view: MobileView; onChange: (v: MobileView) => void; readyCount: number }) {
  const items = [
    { id: 'locks' as const, label: 'My locks', icon: Layers },
    { id: 'new' as const, label: 'New lock', icon: PlusCircle },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-lg pb-safe lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 p-2">
        {items.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition',
                active ? 'bg-ink text-white' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.id === 'locks' && readyCount > 0 && (
                <span className="absolute right-4 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">
                  {readyCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
