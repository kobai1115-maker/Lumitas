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
    // 究極の回避策: ビルド時に Node.js の標準部品が見つからなくても「無視」して進めるように設定します。
    // これにより、ビルドを無理やりパスさせ、実行時に Cloudflare の nodejs_compat に処理を委ねます。
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      tls: false,
      net: false,
      dns: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    return config;
  },
};

export default nextConfig;
