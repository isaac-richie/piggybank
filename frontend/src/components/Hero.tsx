'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Clock, Layers, Lock, ShieldCheck, Wallet } from 'lucide-react';
import { ASSETS, ASSET_LIST } from '@/lib/assets';
import { LOCK_DURATIONS } from '@/lib/contracts';
import { AssetIcon } from '@/components/AssetIcon';

const STEPS = [
  { icon: Wallet, title: 'Pick an asset', body: 'Save in USDC, ETH or WBTC straight from your wallet.' },
  { icon: Clock, title: 'Choose a lock', body: '3, 6, 9 or 12 months. Top up any time before it unlocks.' },
  { icon: Lock, title: 'Withdraw at unlock', body: 'Claim to your wallet or send to any address once the date passes.' },
];

export function Hero() {
  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />

        <div className="container relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live on Base
            </span>

            <h1 className="mt-5 text-balance font-display text-[2.35rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Lock your crypto.
              <br />
              <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,hsl(var(--brand)/0.7)_62%,hsl(var(--brand)/0.7)_92%,transparent_92%)]">
                Keep your promise.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              AssetStrategy is a time-locked savings vault. Set aside USDC, ETH or WBTC for a fixed period and let the
              smart contract hold you to it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    disabled={!mounted}
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lift transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    Connect wallet to start
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </ConnectButton.Custom>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-semibold text-foreground transition hover:bg-accent"
              >
                How it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Non-custodial, open-source contract
              </span>
              <span className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4 text-foreground" />
                <span className="flex -space-x-2">
                  {ASSET_LIST.map((a) => (
                    <AssetIcon key={a.symbol} asset={a} className="h-6 w-6 text-xs" />
                  ))}
                </span>
                USDC · ETH · WBTC
              </span>
            </div>
          </div>

          <PreviewCard />
        </div>
      </section>

      <section id="how-it-works" className="container scroll-mt-20 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">
                  <step.icon className="h-5 w-5 text-ink" />
                </div>
                <span className="font-display text-sm font-semibold text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-xl font-semibold">Four lock periods</p>
            <p className="mt-1 text-sm text-white/60">Funds can’t leave the vault before the unlock date.</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(LOCK_DURATIONS).map((label) => (
              <div key={label} className="rounded-xl bg-white/10 px-3 py-2 text-center sm:px-4">
                <p className="font-display text-xl font-bold text-brand">{label.split(' ')[0]}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/60">months</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Illustrative lock card so first-time visitors can see what they'll get.
function PreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:mx-0 lg:justify-self-end">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand/30 blur-3xl" />
      <div className="rounded-3xl bg-ink p-6 text-white shadow-lift sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Example lock</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
            <Lock className="h-3 w-3" /> Locked
          </span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <AssetIcon asset={ASSETS.USDC} className="h-11 w-11 text-lg ring-white/10" />
          <div>
            <p className="font-display text-4xl font-bold tabular tracking-tight">2,500.00</p>
            <p className="text-sm text-white/60">USDC · 6-month lock</p>
          </div>
        </div>
        <div className="mt-7">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[64%] rounded-full bg-brand" />
          </div>
          <div className="mt-2.5 flex justify-between text-xs text-white/60">
            <span>64% of the way there</span>
            <span>65 days left</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Topped up</p>
            <p className="mt-0.5 font-display font-semibold">3 times</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Unlocks</p>
            <p className="mt-0.5 font-display font-semibold">in 2 months</p>
          </div>
        </div>
      </div>
    </div>
  );
}
