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
  experimental: {
    // 解決策の核心: pg をビルドツールの分析対象から「完全に除外」します。
    // これにより、ビルドツールが中身を見て「crypto がない」と騒ぐのを物理的に封じます。
    serverComponentsExternalPackages: ["pg"],
  },
  webpack: (config) => {
    // Webpack レベルでも pg を外部化し、一切の中身の解析を禁止します。
    config.externals = [...(config.externals || []), "pg", "pg-native"];
    return config;
  },
};

export default nextConfig;
