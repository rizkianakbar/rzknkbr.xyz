import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Inlined at build, so JSON-LD `dateModified` doesn't move on every hourly ISR rebuild.
  env: { BUILT_AT: new Date().toISOString() },
  // 16 is Next's pre-v16 default, kept for the pixelated testimonial portraits.
  images: { formats: ['image/avif', 'image/webp'], imageSizes: [16, 32, 48, 64, 96, 128, 256, 384] },
  // Pin the workspace root: a stray lockfile higher up the directory tree (e.g. ~/pnpm-lock.yaml)
  // otherwise makes Next.js guess the wrong root and warn on every build.
  turbopack: { root: __dirname },
};

export default nextConfig;
