import { ArrowUpRight } from 'lucide-react';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '@/lib/contracts';
import { Logo } from '@/components/Header';

export function Footer() {
  const links = [
    { label: 'Contract on Basescan', href: `${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}` },
    { label: 'GitHub', href: 'https://github.com/isaac-richie/piggybank' },
    { label: 'Base docs', href: 'https://docs.base.org' },
  ];

  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Time-locked savings for USDC, ETH and WBTC on {NETWORK_CONFIG.name}. Your keys, your lock.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </nav>
          <p className="font-mono text-xs text-muted-foreground">
            {CONTRACT_ADDRESS.slice(0, 8)}…{CONTRACT_ADDRESS.slice(-6)} · © {new Date().getFullYear()} AssetStrategy
          </p>
        </div>
      </div>
    </footer>
  );
}
