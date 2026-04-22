import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPersonaMeta, personaIframeUrl } from '@/lib/worker';
import { RealPlayerClip } from '@/components/RealPlayerClip';
import { CrtFrame } from '@/components/CrtFrame';

export const dynamic = 'force-dynamic';

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = await getPersonaMeta(id);
  if (!meta) notFound();

  const iframeSrc = personaIframeUrl(id);
  const envKey = process.env.NEXT_PUBLIC_MUX_ENV_KEY;

  return (
    <CrtFrame>
      {/* Top bar */}
      <div className="flex justify-between items-center py-4 px-4 bg-[#c0c0c0] text-black text-xs font-bold border-b-2 border-b-[#808080]">
        <Link href="/" className="bevel px-3 py-1 text-xs">
          {'< STUMBLE AGAIN'}
        </Link>
        <div className="flex gap-4 items-center">
          <span>
            💾 <span className="counter">0000</span> saved
          </span>
          <span className="text-[#000080]">
            👀 <span className="blink">●</span> stumblers here
          </span>
        </div>
      </div>

      {/* Main: iframe + sidebar */}
      <div className="flex gap-4 p-4">
        {/* Iframe: agent-written Y2K page */}
        <div className="flex-1 bg-white">
          <iframe
            src={iframeSrc}
            className="w-full border-2 border-[#808080]"
            style={{ height: 720 }}
            title={`${meta.name}'s homepage`}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-[340px] flex flex-col gap-4">
          {/* Persona card */}
          <div className="bg-[#c0c0c0] text-black border-2 border-[#808080] p-3">
            <div className="font-bold text-sm">
              📂 {meta.name} <span className="text-[#606060]">({meta.era})</span>
            </div>
            <div className="text-xs mt-1 text-[#404040]">
              version {meta.version} · status: {meta.status}
            </div>
          </div>

          {/* Guestbook placeholder — Jazz lands in a separate PR */}
          <div className="bg-[#c0c0c0] text-black border-2 border-[#808080] p-3">
            <div className="font-bold text-sm mb-2">📓 GUESTBOOK</div>
            <div className="bg-white border border-[#808080] p-2 text-xs min-h-[120px] italic text-[#606060]">
              (guestbook arrives with the Jazz integration — coming soon)
            </div>
          </div>

          {/* Mux clip */}
          {meta.muxPlaybackId && (
            <div>
              <div className="text-[#00ff00] text-xs mb-2 font-bold">📡 MAKING OF</div>
              <RealPlayerClip
                playbackId={meta.muxPlaybackId}
                personaName={meta.name}
                envKey={envKey}
              />
            </div>
          )}
        </aside>
      </div>

      {/* Status line */}
      <div className="text-[#00ff00] text-xs text-center py-2 border-t border-[#303030]">
        Status: {meta.name} is <span className="text-[#ffff00]">{meta.status}</span>.
      </div>
    </CrtFrame>
  );
}
