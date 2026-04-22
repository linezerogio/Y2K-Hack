import type { ReactNode } from "react";

const PAGE_BG = "#f5edd6";

/**
 * Shared shell for all iteration previews: fixed cream paper tone,
 * full viewport, subtle paper grain via noise is left to each page.
 */
export default function IterationLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: PAGE_BG,
        color: "#1a1207",
      }}
    >
      {children}
    </div>
  );
}
