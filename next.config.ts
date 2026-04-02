import type { NextConfig } from "next";

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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        crypto: "node:crypto",
        net: "node:net",
        tls: "node:tls",
        stream: "node:stream",
        util: "node:util",
        fs: "node:fs",
        events: "node:events",
        buffer: "node:buffer",
        dns: "node:dns",
      };
    }
    return config;
  },
};

export default nextConfig;
