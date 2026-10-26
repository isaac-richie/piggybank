'use client';

import { PiggyBank, Github, ArrowUpRight } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '@/lib/contracts';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink shadow-sm">
        <PiggyBank className="h-5 w-5 text-brand" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight">AssetStrategy</span>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Logo />

        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden items-center md:flex">
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Contract
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/isaac-richie/piggybank"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>

          <ConnectButton
            chainStatus={{ smallScreen: 'none', largeScreen: 'icon' }}
            showBalance={false}
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
          />
        </div>
      </div>
    </header>
  );
}
