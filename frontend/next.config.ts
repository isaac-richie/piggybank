import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Webpack config for non-Turbopack builds
  webpack: (config, { isServer }) => {
    // Ignore optional React Native dependencies that aren't needed for web
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
      };
    }
    return config;
  },
  // Turbopack config for Next.js 16+
  turbopack: {
    resolveAlias: {
      // Point to stub module instead of false (Turbopack doesn't accept boolean values)
      // Using relative path from project root (where next.config.ts is located)
      '@react-native-async-storage/async-storage': './src/lib/stub-modules.ts',
    },
  },
};

export default nextConfig;
