import { stumble } from '@/lib/worker';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const result = await stumble();
    if (!result) {
      return Response.json(
        { error: 'pool_empty', message: 'pages are warming up, try again' },
        { status: 503 },
      );
    }
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'upstream error';
    return Response.json({ error: 'upstream', message }, { status: 502 });
  }
}
