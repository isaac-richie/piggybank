import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { NETWORK_CONFIG } from './contracts';

export const config = getDefaultConfig({
  appName: 'AssetStrategy',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
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
