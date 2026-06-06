import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 30,  // cache dynamic pages for 30s on the client
      static: 300,  // cache static pages for 5min on the client
    },
  },
};

export default nextConfig;
