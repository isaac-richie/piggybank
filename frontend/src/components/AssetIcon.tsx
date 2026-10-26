import { cn } from '@/lib/utils';
import type { AssetMeta } from '@/lib/assets';

export function AssetIcon({ asset, className }: { asset: AssetMeta; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-white shadow-sm ring-2 ring-white/70',
        className
      )}
      style={{ backgroundColor: asset.color }}
    >
      {asset.glyph}
    </span>
  );
}
