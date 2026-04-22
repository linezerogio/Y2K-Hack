import { NextResponse } from 'next/server';
import { stumble } from '@/lib/worker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { personaId } = await stumble();
    return NextResponse.json({ personaId });
  } catch (err) {
    return NextResponse.json(
      { error: 'worker unreachable', detail: (err as Error).message },
      { status: 502 },
    );
  }
}
