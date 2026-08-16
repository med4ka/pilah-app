import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  sw: "/sw.js",
  workboxOptions: {
    cacheId: "pilah-app",
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        // Static assets (JS/CSS/font) — cache-first
        urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/,
        handler: "CacheFirst",
        method: "GET",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // API calls ke backend — network-first, JANGAN cache-first (data harus fresh)
        urlPattern: /\/api\/v1\//,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = withPWA({
  /* config options here */
});

export default nextConfig;