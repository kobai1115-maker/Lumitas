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
  webpack: (config) => {
    // 正攻法: 古いライブラリが探している標準部品を、Cloudflare の本物の部品 (node:前置詞付き) に接続します。
    // これにより、ビルドツールは「存在」を確認でき、実行時には Cloudflare の互換レイヤーが正しく動作します。
    config.resolve.alias = {
      ...config.resolve.alias,
      "crypto": "node:crypto",
      "fs": "node:fs",
      "path": "node:path",
      "net": "node:net",
      "tls": "node:tls",
      "stream": "node:stream",
      "os": "node:os",
    };
    return config;
  },
};

export default nextConfig;
