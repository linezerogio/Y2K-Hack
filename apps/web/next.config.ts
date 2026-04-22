import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;

// OpenNext dev-mode hook — gives `getCloudflareContext()` access to bindings
// when running `next dev`. Safe to leave on; no-op if @opennextjs/cloudflare
// isn't loaded (e.g. plain `next build`).
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
