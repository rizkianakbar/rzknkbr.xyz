import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // Pin the workspace root: a stray lockfile higher up the directory tree (e.g. ~/pnpm-lock.yaml)
  // otherwise makes Next.js guess the wrong root and warn on every build.
  turbopack: { root: __dirname },
};

export default nextConfig;
