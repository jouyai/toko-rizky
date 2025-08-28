import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Lanjutkan build meski ada error lint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
