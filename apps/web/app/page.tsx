import { StumbleButton } from '@/components/StumbleButton';
import { CrtFrame } from '@/components/CrtFrame';

export default function LandingPage() {
  return (
    <CrtFrame>
      <div className="py-6 px-4">
        <marquee className="text-[#ff00ff] text-sm">
          {' '}
          *** Powered by Cloudflare · Neon · Jazz · Mux · Gemini ***
          &nbsp;&nbsp;&nbsp;&nbsp;BEST VIEWED AT 1024x768 !!!
          &nbsp;&nbsp;&nbsp;&nbsp;NO FRAMES, NO FLASH, NO PROBLEM{' '}
        </marquee>
      </div>

      <div className="flex flex-col items-center gap-10 py-16">
        <h1 className="banner-crt crt-flicker text-[#00ff00] text-center">GEOSTUMBLE</h1>

        <p className="text-[#00ff00] text-xl text-center max-w-2xl leading-relaxed">
          the internet before the internet<br />
          was <span className="text-[#ff00ff]">ruined</span>
        </p>

        <p className="text-[#c0c0c0] text-center max-w-2xl px-8 leading-relaxed">
          StumbleUpon, but every page belongs to a fictional persona whose AI brain lives on
          Cloudflare. Click the button. Land on a page the AI wrote for itself. Leave a
          note in the guestbook.
        </p>

        <StumbleButton />

        <div className="text-[#808080] text-xs text-center pt-8">
          <span className="counter">00000042</span> stumblers have visited this page since
          1999-09-14
        </div>
      </div>

      <footer className="text-center py-8 text-[#606060] text-xs">
        <div>© 1999-2026 Geostumble Industries, Inc.</div>
        <div className="pt-1">
          built in 6 hours at Frontier Tech Week Y2K Hackathon ·{' '}
          <span className="text-[#ff00ff]">best viewed in Netscape 4.7</span>
        </div>
      </footer>
    </CrtFrame>
  );
}
