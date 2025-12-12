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
        // Ignore thread-stream test files
        'thread-stream/test/helper': false,
        'thread-stream/test/helper.js': false,
        'thread-stream/test/ts.test': false,
        'thread-stream/test/ts.test.ts': false,
        'thread-stream/test/ts/to-file': false,
        'thread-stream/test/ts/to-file.ts': false,
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
      // Alias thread-stream test files to stub (pino/walletconnect dependency issue)
      'thread-stream/test/helper': './src/lib/stub-modules.ts',
      'thread-stream/test/helper.js': './src/lib/stub-modules.ts',
      'thread-stream/test/ts.test': './src/lib/stub-modules.ts',
      'thread-stream/test/ts.test.ts': './src/lib/stub-modules.ts',
      'thread-stream/test/ts/to-file': './src/lib/stub-modules.ts',
      'thread-stream/test/ts/to-file.ts': './src/lib/stub-modules.ts',
    },
    // Exclude test files from node_modules to prevent build errors
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
};

export default nextConfig;
