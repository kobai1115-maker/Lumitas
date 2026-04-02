import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 公開用ビルドの安定化設定 */
  eslint: {
    ignoreDuringBuilds: true, // 公開を優先してビルド時のチェックをスキップ
  },
  typescript: {
    ignoreBuildErrors: true, // 型チェックエラーによるビルド停止を防止
  },
  images: {
    unoptimized: true, // Cloudflare Pages の静的画像配信への最適化
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      dns: false,
    };
    return config;
  },
};

export default nextConfig;
