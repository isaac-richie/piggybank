'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi, isAddress, type Address } from 'viem';
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, PauseCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import {
  explorerTxUrl,
  useIsWhitelisted,
  useIsWrongNetwork,
  useOwnership,
  useUserLocks,
  useVaultActions,
  useVaultHealth,
} from '@/hooks/useContract';
import { useNow } from '@/hooks/useNow';
import { ASSETS, ASSET_LIST, assetById, type AssetSymbol } from '@/lib/assets';
import { NETWORK_CONFIG, USDC_ADDRESS, WBTC_ADDRESS } from '@/lib/contracts';
import { cn, formatAmount, formatShortDate, sanitizeAmountInput, tryParseAmount } from '@/lib/utils';
import { getTxErrorMessage } from '@/lib/tx-errors';
import { toast } from '@/hooks/use-toast';
import { AssetIcon } from '@/components/AssetIcon';
import { StatusBanner } from '@/components/StatusBanner';

type Actions = ReturnType<typeof useVaultActions>;

const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—');

// Runs an admin write with a confirmation prompt, toast and inline error reporting.
function useAdminRunner(actions: Actions) {
  const [error, setError] = useState<string | null>(null);

  const exec = async (key: string, fn: string, args: readonly unknown[], title: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return false;
    setError(null);
    try {
      const hash = await actions.admin(key, fn, args);
      toast({
        title,
        description: (
          <a className="font-semibold underline" href={explorerTxUrl(hash)} target="_blank" rel="noopener noreferrer">
            View transaction
          </a>
        ),
      });
      return true;
    } catch (err) {
      console.error(`${fn} failed:`, err);
      setError(getTxErrorMessage(err));
      return false;
    }
  };

  return { exec, error };
}

export function AdminPanel() {
  const { isConnected } = useAccount();
  const { owner, pendingOwner, isOwner, isPendingOwner } = useOwnership();
  const wrongNetwork = useIsWrongNetwork();
  const actions = useVaultActions();

  if (!isConnected) {
    return <Gate title="Connect the owner wallet" body="The admin panel is only available to the vault owner." />;
  }
  if (!owner) {
    return <Gate title="Loading vault…" body="Reading the owner from the contract." loading />;
  }
  if (!isOwner && !isPendingOwner) {
    return (
      <Gate
        title="Owner only"
        body={`This wallet isn't the vault owner. Connect ${short(owner)} to manage the vault.`}
      />
    );
  }

  return (
    <div className="container space-y-6 pb-16 pt-6 sm:pt-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl font-bold">Vault control</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Owner <span className="font-mono text-foreground">{short(owner)}</span>
          {pendingOwner && pendingOwner !== '0x0000000000000000000000000000000000000000' && (
            <> · pending <span className="font-mono text-foreground">{short(pendingOwner)}</span></>
          )}
        </p>
      </div>

      <StatusBanner />

      {isPendingOwner && !isOwner ? (
        <AcceptOwnership actions={actions} disabled={wrongNetwork} />
      ) : (
        <>
          <Health actions={actions} disabled={wrongNetwork} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0 space-y-6">
              <Settle actions={actions} disabled={wrongNetwork} />
              <Ownership actions={actions} disabled={wrongNetwork} />
            </div>
            <div className="min-w-0 space-y-6">
              <Rescue actions={actions} disabled={wrongNetwork} />
              <Whitelist actions={actions} disabled={wrongNetwork} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Gate({ title, body, loading }: { title: string; body: string; loading?: boolean }) {
  return (
    <div className="container py-20">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-10 text-center shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <h1 className="mt-4 font-display text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-2xl bg-destructive-soft p-3.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{error}</p>
    </div>
  );
}

function ActionButton({
  busy,
  disabled,
  onClick,
  children,
  variant = 'primary',
}: {
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'outline';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        variant === 'outline' && 'border border-border hover:border-foreground/40'
      )}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { invalid, className, ...rest } = props;
  return (
    <input
      autoComplete="off"
      spellCheck={false}
      {...rest}
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm outline-none focus:border-foreground',
        invalid ? 'border-destructive' : 'border-input',
        className
      )}
    />
  );
}

// ---------- Reserves vs balances + pause ----------

function Health({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const health = useVaultHealth();
  const { exec, error } = useAdminRunner(actions);

  return (
    <Section title="Reserves vs balances" description="What users are owed against what the vault holds. Only surplus can be rescued.">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {ASSET_LIST.map((asset) => {
          const reserved = health.reserved[asset.symbol];
          const held = health.held[asset.symbol];
          const short = held < reserved;
          const fmt = (v: bigint) => formatAmount(v, asset.decimals, asset.displayDecimals);
          const coverage = reserved === 0n ? 100 : Math.min(100, Number((held * 10_000n) / reserved) / 100);
          return (
            <div
              key={asset.symbol}
              className={cn('rounded-2xl border p-4', short ? 'border-destructive/40 bg-destructive-soft' : 'border-border bg-background')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AssetIcon asset={asset} className="h-7 w-7 text-xs" />
                  <span className="font-semibold">{asset.symbol}</span>
                </div>
                {short ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> Shortfall
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Covered
                  </span>
                )}
              </div>
              <dl className="mt-3 space-y-1.5 text-sm tabular">
                <Row label="Owed to users" value={health.isLoading ? '…' : fmt(reserved)} />
                <Row label="Held by vault" value={health.isLoading ? '…' : fmt(held)} />
                <Row
                  label={short ? 'Missing' : 'Surplus'}
                  value={health.isLoading ? '…' : fmt(short ? reserved - held : held - reserved)}
                  strong
                />
              </dl>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={cn('h-full rounded-full', short ? 'bg-destructive' : 'bg-success')} style={{ width: `${coverage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {health.paused ? <PauseCircle className="mt-0.5 h-5 w-5 text-warning" /> : <PlayCircle className="mt-0.5 h-5 w-5 text-success" />}
          <div>
            <p className="font-semibold">{health.paused ? 'Vault is paused' : 'Vault is live'}</p>
            <p className="text-sm text-muted-foreground">
              Pausing stops deposits, top-ups, withdrawals and forwards. Admin settlements still work.
            </p>
          </div>
        </div>
        {health.paused ? (
          <ActionButton
            busy={actions.pending?.key === 'unpause'}
            disabled={disabled || actions.isBusy}
            onClick={() => exec('unpause', 'unpause', [], 'Vault unpaused')}
          >
            Unpause
          </ActionButton>
        ) : (
          <ActionButton
            variant="danger"
            busy={actions.pending?.key === 'pause'}
            disabled={disabled || actions.isBusy}
            onClick={() =>
              exec('pause', 'pause', [], 'Vault paused', 'Pause the vault? Users will not be able to deposit or withdraw until you unpause.')
            }
          >
            Pause vault
          </ActionButton>
        )}
      </div>
      <ErrorNote error={error} />
    </Section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('truncate', strong && 'font-semibold')}>{value}</dd>
    </div>
  );
}

// ---------- Settle deposits ----------

function Settle({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const [userInput, setUserInput] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const user = isAddress(userInput) ? (userInput as Address) : undefined;
  const { locks, isLoading, refetch } = useUserLocks(user);
  const health = useVaultHealth();
  const now = useNow();
  const { exec, error } = useAdminRunner(actions);

  const open = locks.filter((l) => !l.isWithdrawn);
  const chosen = open.filter((l) => selected.includes(l.id));
  const payout = chosen.reduce(
    (acc, l) => ({ ...acc, [assetById(l.assetType).symbol]: acc[assetById(l.assetType).symbol] + l.amount }),
    { USDC: 0n, ETH: 0n, WBTC: 0n } as Record<AssetSymbol, bigint>
  );
  const cantPay = ASSET_LIST.filter((a) => payout[a.symbol] > health.held[a.symbol]);

  const toggle = (id: number) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const settle = async () => {
    if (!user || chosen.length === 0) return;
    const summary = ASSET_LIST.filter((a) => payout[a.symbol] > 0n)
      .map((a) => `${formatAmount(payout[a.symbol], a.decimals, a.displayDecimals)} ${a.symbol}`)
      .join(' + ');
    const ok =
      chosen.length === 1
        ? await exec('settle', 'adminSettleDeposit', [user, BigInt(chosen[0].id)], 'Deposit settled', `Pay ${summary} to ${short(user)} now and close lock #${chosen[0].id}?`)
        : await exec(
            'settle',
            'adminSettleDeposits',
            [user, chosen.map((l) => BigInt(l.id))],
            `${chosen.length} deposits settled`,
            `Pay ${summary} to ${short(user)} now and close ${chosen.length} locks? If any payout fails, none are settled.`
          );
    if (ok) {
      setSelected([]);
      refetch();
    }
  };

  return (
    <Section title="Settle deposits" description="Pay a user's locks out early. Funds go to the depositor's own address.">
      <TextField
        placeholder="User address 0x…"
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value.trim());
          setSelected([]);
        }}
        invalid={!!userInput && !user}
        className="font-mono"
      />

      {user && (
        <div className="mt-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading locks…</p>
          ) : open.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open locks for this address{locks.length ? ` (${locks.length} closed)` : ''}.
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{open.length} open lock{open.length === 1 ? '' : 's'}</span>
                <button
                  type="button"
                  className="font-semibold hover:underline"
                  onClick={() => setSelected(chosen.length === open.length ? [] : open.map((l) => l.id))}
                >
                  {chosen.length === open.length ? 'Clear' : 'Select all'}
                </button>
              </div>
              <ul className="max-h-72 space-y-1.5 overflow-y-auto">
                {open.map((lock) => {
                  const asset = assetById(lock.assetType);
                  const ready = now >= lock.unlockTime;
                  return (
                    <li key={lock.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                          selected.includes(lock.id) ? 'border-foreground bg-foreground/[0.03]' : 'border-border'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(lock.id)}
                          onChange={() => toggle(lock.id)}
                          className="h-4 w-4 accent-[hsl(var(--ink))]"
                        />
                        <AssetIcon asset={asset} className="h-7 w-7 text-xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold tabular">
                            {formatAmount(lock.amount, asset.decimals, asset.displayDecimals)} {asset.symbol}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            #{lock.id} · {ready ? 'unlocked' : 'unlocks'} {formatShortDate(lock.unlockTime)}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {cantPay.length > 0 && (
        <p className="mt-3 text-sm text-destructive">
          The vault doesn&apos;t hold enough {cantPay.map((a) => a.symbol).join(' / ')} to pay this selection.
        </p>
      )}

      <div className="mt-4">
        <ActionButton
          busy={actions.pending?.key === 'settle'}
          disabled={disabled || actions.isBusy || chosen.length === 0 || cantPay.length > 0}
          onClick={settle}
        >
          {chosen.length > 1 ? `Settle ${chosen.length} locks` : 'Settle lock'}
        </ActionButton>
      </div>
      <ErrorNote error={error} />
    </Section>
  );
}

// ---------- Rescue surplus ----------

type RescueTarget = AssetSymbol | 'OTHER';

function Rescue({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const { address } = useAccount();
  const health = useVaultHealth();
  const { exec, error } = useAdminRunner(actions);
  const [target, setTarget] = useState<RescueTarget>('USDC');
  const [tokenInput, setTokenInput] = useState('');
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState('');

  const customToken = isAddress(tokenInput) ? (tokenInput as Address) : undefined;
  const { data: customDecimals } = useReadContract({
    address: customToken,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: NETWORK_CONFIG.chainId,
    query: { enabled: target === 'OTHER' && !!customToken },
  });

  const recipient = to || address || '';
  const recipientValid = isAddress(recipient);
  const known = target !== 'OTHER' ? ASSETS[target] : undefined;
  const decimals = known?.decimals ?? (customDecimals as number | undefined);
  const surplus = known ? (health.held[known.symbol] > health.reserved[known.symbol] ? health.held[known.symbol] - health.reserved[known.symbol] : 0n) : undefined;
  const parsed = decimals !== undefined ? tryParseAmount(amount, decimals) : null;
  const tooMuch = surplus !== undefined && parsed !== null && parsed > surplus;

  const tokenAddress = target === 'USDC' ? USDC_ADDRESS : target === 'WBTC' ? WBTC_ADDRESS : customToken;

  const rescue = async () => {
    if (!recipientValid) return;
    if (target === 'ETH') {
      await exec('rescue', 'rescueETH', [recipient], 'ETH surplus rescued', `Send all surplus ETH (${formatAmount(surplus ?? 0n, 18, 6)}) to ${short(recipient)}?`);
      return;
    }
    if (!parsed || !tokenAddress) return;
    const ok = await exec(
      'rescue',
      'rescueTokens',
      [tokenAddress, parsed, recipient],
      'Tokens rescued',
      `Send ${amount} ${known?.symbol ?? 'tokens'} to ${short(recipient)}?`
    );
    if (ok) setAmount('');
  };

  return (
    <Section title="Rescue surplus" description="Recover funds above what users are owed, such as tokens sent to the vault by mistake.">
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-secondary p-1">
        {(['USDC', 'ETH', 'WBTC', 'OTHER'] as RescueTarget[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTarget(t);
              setAmount('');
            }}
            className={cn(
              'rounded-lg py-1.5 text-xs font-semibold transition sm:text-sm',
              target === t ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'OTHER' ? 'Other' : t}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {target === 'OTHER' && (
          <TextField
            placeholder="Token address 0x…"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value.trim())}
            invalid={!!tokenInput && !customToken}
            className="font-mono"
          />
        )}

        {known && (
          <p className="text-sm text-muted-foreground">
            Rescuable surplus:{' '}
            <span className="font-semibold text-foreground tabular">
              {formatAmount(surplus ?? 0n, known.decimals, known.displayDecimals)} {known.symbol}
            </span>
          </p>
        )}

        {target !== 'ETH' && (
          <div className="flex gap-2">
            <TextField
              inputMode="decimal"
              placeholder={decimals === undefined ? 'Enter token address first' : 'Amount'}
              value={amount}
              disabled={decimals === undefined}
              onChange={(e) => setAmount(sanitizeAmountInput(e.target.value, decimals ?? 18))}
              invalid={tooMuch}
              className="tabular"
            />
            {known && surplus !== undefined && surplus > 0n && (
              <ActionButton
                variant="outline"
                onClick={() => setAmount(formatAmount(surplus, known.decimals, known.decimals).replace(/,/g, ''))}
              >
                Max
              </ActionButton>
            )}
          </div>
        )}

        <TextField
          placeholder={address ? `Recipient (defaults to you, ${short(address)})` : 'Recipient 0x…'}
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          invalid={!!to && !isAddress(to)}
          className="font-mono"
        />
      </div>

      {tooMuch && <p className="mt-2 text-sm text-destructive">That is more than the surplus. User funds can&apos;t be rescued.</p>}

      <div className="mt-4">
        <ActionButton
          busy={actions.pending?.key === 'rescue'}
          disabled={
            disabled ||
            actions.isBusy ||
            !recipientValid ||
            (target === 'ETH' ? !surplus : !parsed || tooMuch || !tokenAddress)
          }
          onClick={rescue}
        >
          {target === 'ETH' ? 'Rescue all surplus ETH' : 'Rescue tokens'}
        </ActionButton>
      </div>
      <ErrorNote error={error} />
    </Section>
  );
}

// ---------- Whitelist ----------

function Whitelist({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const health = useVaultHealth();
  const { exec, error } = useAdminRunner(actions);
  const [lookup, setLookup] = useState('');
  const [batch, setBatch] = useState('');
  const lookupAddress = isAddress(lookup) ? (lookup as Address) : undefined;
  const isListed = useIsWhitelisted(lookupAddress);

  const parsedBatch = batch.split(/[\s,;]+/).filter(Boolean);
  const validBatch = parsedBatch.filter((a) => isAddress(a)) as Address[];
  const invalidCount = parsedBatch.length - validBatch.length;

  return (
    <Section
      title="Allowlist"
      description={health.whitelistEnabled ? 'Only listed addresses can deposit or top up.' : 'Off: anyone can deposit. Withdrawals are never restricted.'}
    >
      <div className="flex items-center justify-between rounded-2xl bg-secondary p-3.5">
        <span className="text-sm font-semibold">{health.whitelistEnabled ? 'Allowlist enforced' : 'Allowlist off'}</span>
        <ActionButton
          variant={health.whitelistEnabled ? 'outline' : 'primary'}
          busy={actions.pending?.key === 'wl-toggle'}
          disabled={disabled || actions.isBusy}
          onClick={() =>
            health.whitelistEnabled
              ? exec('wl-toggle', 'disableWhitelist', [], 'Allowlist disabled')
              : exec('wl-toggle', 'enableWhitelist', [], 'Allowlist enabled', 'Enable the allowlist? Addresses not on it will be unable to deposit or top up.')
          }
        >
          {health.whitelistEnabled ? 'Turn off' : 'Turn on'}
        </ActionButton>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold">Check or change one address</label>
        <TextField
          placeholder="0x…"
          value={lookup}
          onChange={(e) => setLookup(e.target.value.trim())}
          invalid={!!lookup && !lookupAddress}
          className="mt-1.5 font-mono"
        />
        {lookupAddress && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold',
                isListed ? 'bg-success-soft text-success' : 'bg-secondary text-muted-foreground'
              )}
            >
              {isListed === undefined ? 'Checking…' : isListed ? 'On allowlist' : 'Not listed'}
            </span>
            {isListed === false && (
              <ActionButton
                variant="outline"
                busy={actions.pending?.key === 'wl-one'}
                disabled={disabled || actions.isBusy}
                onClick={() => exec('wl-one', 'addToWhitelist', [lookupAddress], 'Address added')}
              >
                Add
              </ActionButton>
            )}
            {isListed && (
              <ActionButton
                variant="outline"
                busy={actions.pending?.key === 'wl-one'}
                disabled={disabled || actions.isBusy}
                onClick={() => exec('wl-one', 'removeFromWhitelist', [lookupAddress], 'Address removed')}
              >
                Remove
              </ActionButton>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold">Add many (one per line or comma-separated)</label>
        <textarea
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder={'0x…\n0x…'}
          className="mt-1.5 w-full rounded-xl border border-input bg-background p-3 font-mono text-xs outline-none focus:border-foreground"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {validBatch.length} valid{invalidCount > 0 && <span className="text-destructive"> · {invalidCount} invalid</span>}
          </span>
          <ActionButton
            busy={actions.pending?.key === 'wl-batch'}
            disabled={disabled || actions.isBusy || validBatch.length === 0 || invalidCount > 0}
            onClick={async () => {
              if (await exec('wl-batch', 'addMultipleToWhitelist', [validBatch], `${validBatch.length} addresses added`)) setBatch('');
            }}
          >
            Add {validBatch.length || ''} to allowlist
          </ActionButton>
        </div>
      </div>
      <ErrorNote error={error} />
    </Section>
  );
}

// ---------- Ownership ----------

function Ownership({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const { exec, error } = useAdminRunner(actions);
  const [next, setNext] = useState('');
  const valid = isAddress(next);

  return (
    <Section
      title="Transfer ownership"
      description="Two-step: the new owner must open this page and accept before anything changes. Use a multisig if you can."
    >
      <TextField placeholder="New owner 0x…" value={next} onChange={(e) => setNext(e.target.value.trim())} invalid={!!next && !valid} className="font-mono" />
      <div className="mt-3">
        <ActionButton
          busy={actions.pending?.key === 'transfer'}
          disabled={disabled || actions.isBusy || !valid}
          onClick={async () => {
            const ok = await exec(
              'transfer',
              'transferOwnership',
              [next],
              'Ownership transfer started',
              `Propose ${next} as the new owner? You stay owner until they accept.`
            );
            if (ok) setNext('');
          }}
        >
          Propose new owner
        </ActionButton>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Renouncing ownership is intentionally not offered here: it would permanently remove pause, settlement and rescue.
      </p>
      <ErrorNote error={error} />
    </Section>
  );
}

function AcceptOwnership({ actions, disabled }: { actions: Actions; disabled: boolean }) {
  const { exec, error } = useAdminRunner(actions);
  return (
    <Section title="Accept ownership" description="The current owner has proposed this wallet as the new vault owner.">
      <ActionButton
        busy={actions.pending?.key === 'accept'}
        disabled={disabled || actions.isBusy}
        onClick={() => exec('accept', 'acceptOwnership', [], 'You are now the owner', 'Accept ownership of the vault?')}
      >
        Accept ownership
      </ActionButton>
      <ErrorNote error={error} />
    </Section>
  );
}
