'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

/**
 * Client-only wrapper for the Jazz provider.
 *
 * Jazz's `JazzReactProvider` pulls in `cojson-core-wasm` which (a) breaks
 * webpack bundling (wasm-bindgen `wbg` imports webpack can't resolve) and
 * (b) needs a Cloudflare Workers runtime to load when SSR'd. Loading the
 * provider via `next/dynamic({ ssr: false })` skips both — but
 * `dynamic({ ssr: false })` is illegal in server components, so the
 * dynamic call has to live behind this `'use client'` boundary.
 *
 * Jazz-consuming components (Guestbook, PresencePill, StatusBanner) all
 * render placeholder UI when their room is undefined, so the brief SSR
 * pass without Jazz produces a valid skeleton that hydrates cleanly.
 */
const JazzClientProvider = dynamic(
  () => import('@/lib/jazz').then((m) => m.JazzClientProvider),
  { ssr: false },
);

export function JazzBoundary({ children }: { children: ReactNode }) {
  return <JazzClientProvider>{children}</JazzClientProvider>;
}
