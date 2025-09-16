import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    qualities: [75, 85],
  },
  experimental: {
    allowedDevOrigins: [
      'https://sistema-feedback-v-2.lindy.site'
    ],
  },
};
export default nextConfig;