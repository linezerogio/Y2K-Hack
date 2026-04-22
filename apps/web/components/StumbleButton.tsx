'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function StumbleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stumble');
      if (!res.ok) throw new Error(`stumble failed: ${res.status}`);
      const { personaId } = (await res.json()) as { personaId: string };
      router.push(`/s/${personaId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button className="bevel-lime" onClick={onClick} disabled={loading}>
        {loading ? 'STUMBLING…' : '*** STUMBLE! ***'}
      </button>
      {error && (
        <p className="text-red-400 font-mono text-sm">the internet is having a moment: {error}</p>
      )}
    </div>
  );
}
