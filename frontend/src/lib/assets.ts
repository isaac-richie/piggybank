// Asset metadata shared by the deposit form, lock list and portfolio.
// `id` matches the contract's AssetType enum (USDC = 0, ETH = 1, WBTC = 2).
export type AssetSymbol = 'USDC' | 'ETH' | 'WBTC';

export type AssetMeta = {
  id: number;
  symbol: AssetSymbol;
  name: string;
  decimals: number;
  displayDecimals: number;
  glyph: string;
  color: string;
};

export const ASSETS: Record<AssetSymbol, AssetMeta> = {
  USDC: { id: 0, symbol: 'USDC', name: 'USD Coin', decimals: 6, displayDecimals: 2, glyph: '$', color: '#2775CA' },
  ETH: { id: 1, symbol: 'ETH', name: 'Ether', decimals: 18, displayDecimals: 5, glyph: 'Ξ', color: '#627EEA' },
  WBTC: { id: 2, symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, displayDecimals: 6, glyph: '₿', color: '#F7931A' },
};

export const ASSET_LIST: AssetMeta[] = [ASSETS.USDC, ASSETS.ETH, ASSETS.WBTC];

export const assetById = (id: number): AssetMeta => ASSET_LIST[id] ?? ASSETS.USDC;
