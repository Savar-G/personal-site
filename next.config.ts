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
};

export default nextConfig;
