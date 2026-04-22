import Link from 'next/link';
import { ResultShell } from '@/components/ResultShell';
import { getPersonaMeta } from '@/lib/worker';

export default async function StumbleResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = await getPersonaMeta(id);

  if (!meta) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 18%, #1a1028 0%, #020205 100%)',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          color: '#fff16a',
          fontFamily: '"Comic Sans MS", Comic Sans, cursive',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            border: '2px solid #ff67c8',
            background: '#0a0614',
            padding: '24px 32px',
            maxWidth: 480,
            textShadow: '0 0 8px #ff67c8',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            this page is still being built
          </p>
          <p style={{ margin: '8px 0 18px', color: '#c89eff' }}>
            persona <code>{id}</code> has not tinkered yet.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              border: '2px solid #ff67c8',
              color: '#ff67c8',
              textDecoration: 'none',
              padding: '8px 16px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textShadow: '0 0 8px #ff67c8',
            }}
          >
            stumble again
          </Link>
        </div>
      </main>
    );
  }

  return <ResultShell meta={meta} />;
}
