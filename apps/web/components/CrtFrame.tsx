import type { ReactNode } from 'react';

/**
 * The 1024x768 "monitor" that wraps the stumble result view.
 *
 * Centered on larger screens with a letterboxed neon bezel so it still
 * reads as intentional on judge laptops. The brief calls this the
 * "two layer" split: neon chrome outside, persona iframe inside.
 */
type Props = {
  topBar: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function CrtFrame({ topBar, footer, children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 12%, #1f1630 0%, #05050a 62%)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 'min(1100px, 100%)',
          background: 'linear-gradient(180deg, #191223 0%, #08070d 100%)',
          border: '3px solid #57406f',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1024,
            margin: '0 auto',
            minHeight: 768,
            background: '#060b14',
            border: '2px solid #02050b',
            borderRadius: 10,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: '52px 1fr 28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'linear-gradient(180deg, #ddd3f4 0%, #9f8bbb 100%)',
              borderBottom: '2px solid #4d3d66',
              color: '#1b1330',
              fontFamily: 'Tahoma, Verdana, sans-serif',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              padding: '0 12px',
              textTransform: 'uppercase',
            }}
          >
            {topBar}
          </div>
          {children}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.18)',
              color: '#cbb7e8',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 12px',
              font: '0.68rem Tahoma, Verdana, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {footer ?? (
              <span>powered by cloudflare - workers - jazz - mux</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
