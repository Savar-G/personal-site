import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root. A stray package-lock.json in a parent directory
    // makes Turbopack infer that directory as the root, and `next dev` then
    // recursively watches everything under it — which balloons memory until the
    // dev server is OOM-killed. Keep the watch scope on this repo only.
    root: __dirname,
  },
  images: {
    // YouTube posters for the video embeds go through the image optimizer, so
    // they arrive sized to the screen and from this site.
    remotePatterns: [new URL("https://i.ytimg.com/vi_webp/**")],
  },
  experimental: {
    // Desk objects fly into their pages (React <ViewTransition>, see
    // app/_components/desk and the flights section in globals.css).
    viewTransition: true,
  },
};

export default nextConfig;
