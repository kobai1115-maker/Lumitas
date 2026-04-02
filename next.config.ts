import type { NextConfig } from "next";
import pathS from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // 依存関係のスり替え: 'fs' 依存を抹殺した自作部品に差し替えます
    config.resolve.alias = {
      ...config.resolve.alias,
      "pg-connection-string": pathS.resolve(__dirname, "src/lib/shims/pg-shim.js"),
      "pgpass": pathS.resolve(__dirname, "src/lib/shims/pgpass-shim.js"),
      "pg-native": false,
      "fs": false,
      "path": false,
      "os": false,
      "tls": false,
      "net": false,
      "dns": false,
    };
    return config;
  },
};

export default nextConfig;
