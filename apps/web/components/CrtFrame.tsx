import type { ReactNode } from 'react';

export function CrtFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-[#00ff00] font-mono scanlines">
      <div className="mx-auto" style={{ width: 1024 }}>
        {children}
      </div>
    </div>
  );
}
