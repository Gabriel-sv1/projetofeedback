import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  compiler: {},
  experimental: {
    turbo: false
  },
};

export default nextConfig;