import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { NETWORK_CONFIG } from './contracts';

export const config = getDefaultConfig({
  appName: 'AssetStrategy',
  // Default to the known project ID to avoid failing when env is missing in deployment
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '6a94c111b5762d5e6c47476bd8d4fcb2',
  chains: [
    {
      ...base,
      id: NETWORK_CONFIG.chainId,
      name: NETWORK_CONFIG.name,
      rpcUrls: {
        default: {
          http: [NETWORK_CONFIG.rpcUrl],
        },
        public: {
          http: [NETWORK_CONFIG.rpcUrl],
        },
      },
    },
  ],
  ssr: true,
});
