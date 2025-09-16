import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    allowedDevOrigins: [
      'https://sistema-feedback-v-2.lindy.site'
    ],
  },
};
export default nextConfig;