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
  // 最終兵器: pg を「分解・加工」の対象から外します。
  // これにより、ビルドツールが中身を見てエラー（fs がない、crypto がない等）を出すのを物理的に止めます。
  serverExternalPackages: ["pg", "pg-connection-string"],
};

export default nextConfig;
