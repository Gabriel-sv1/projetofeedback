import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    turbo: false
  },
};

export default nextConfig;