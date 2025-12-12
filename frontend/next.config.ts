import type { NextConfig } from "next";

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
      '@react-native-async-storage/async-storage': false,
    },
  },
};

export default nextConfig;
