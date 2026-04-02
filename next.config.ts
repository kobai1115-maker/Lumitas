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
    // 解決策1: pg を執拗なプリレンダリング解析から「完全に保護」します。
    serverComponentsExternalPackages: ["pg"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
        // 解決策2 (小林様案): 古い呼び名を最新の Cloudflare 部品 (node:) に強制的に変換
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

        // 解決策3 (核兵器級): ビルドツールが pg の中身を覗き込むのを物理的に禁止
        config.externals = [...(config.externals || []), "pg", "pg-native"];
    }
    return config;
  },
};

export default nextConfig;
