import Link from "next/link";
import { StumbleButton } from "@/components/StumbleButton";

export default function Home() {
  const pixelLetters = "GEOSTUMBLE".split("");
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 18%, #1a1028 0%, #0a0614 55%, #020205 100%)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(90deg, rgba(255,103,200,0.08) 0 1px, transparent 1px 120px), repeating-linear-gradient(0deg, rgba(115,239,255,0.08) 0 1px, transparent 1px 80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(1080px, 100%)",
          border: "6px solid #2a1a40",
          borderRadius: 20,
          background: "#05030a",
          padding: 14,
          boxShadow:
            "0 0 0 4px #000, 0 0 50px rgba(255,103,200,0.35), 20px 24px 0 rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            border: "3px solid #ff67c8",
            background: "linear-gradient(180deg, #16081f 0%, #05020a 100%)",
            padding: "22px 22px 14px",
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff16a",
              fontFamily: "Impact, sans-serif",
              letterSpacing: "0.2em",
              fontSize: "0.9rem",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                border: "2px solid #fff16a",
                color: "#fff16a",
                textShadow: "0 0 8px #fff16a",
              }}
            >
              HOME 03
            </span>
            <span style={{ color: "#73efff", textShadow: "0 0 8px #73efff" }}>
              Q1 // LIVE // 4TH AND GOAL
            </span>
            <span
              style={{
                padding: "4px 10px",
                border: "2px solid #ff67c8",
                color: "#ff67c8",
                textShadow: "0 0 8px #ff67c8",
              }}
            >
              AWAY 99
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,103,200,0.14) 0%, transparent 70%)",
              borderTop: "1px dashed rgba(255,103,200,0.4)",
              borderBottom: "1px dashed rgba(115,239,255,0.4)",
              flexWrap: "wrap",
            }}
          >
            {pixelLetters.map((ch, i) => {
              const color =
                i % 3 === 0 ? "#fff16a" : i % 3 === 1 ? "#ff67c8" : "#73efff";
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: "Impact, sans-serif",
                    fontSize: "clamp(2.6rem, 7vw, 4.8rem)",
                    color,
                    lineHeight: 1,
                    padding: "4px 6px",
                    background: "rgba(0,0,0,0.6)",
                    border: `2px solid ${color}`,
                    textShadow: `0 0 10px ${color}, 0 0 22px ${color}`,
                    boxShadow: `0 0 16px ${color}, inset 0 0 10px rgba(0,0,0,0.6)`,
                    letterSpacing: "0.04em",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{ display: "grid", placeItems: "center", gap: 14 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "Courier New, monospace",
                fontSize: "0.82rem",
                letterSpacing: "0.22em",
                color: "#c89eff",
                textAlign: "center",
                maxWidth: 620,
              }}
            >
              HALFTIME SHOW // RANDOM PERSONAL HOMEPAGES //
              <br />
              ONE CLICK, INSTANT ERA SHOCK
            </p>
            <StumbleButton />
          </div>
          <div
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              padding: "6px 0",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              color: "#fff16a",
              fontFamily: "Courier New, monospace",
              fontSize: "0.76rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: "geostumble-marquee 14s linear infinite",
              }}
            >
              TICKER // guestbook online // presence stable // mux encoding clean //
              next kickoff in 00:00:04 // powered by workers + jazz + mux //
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 10,
          textAlign: "center",
          color: "#6f5a8c",
          fontFamily: "Tahoma, Verdana, sans-serif",
          fontSize: "0.68rem",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
        }}
      >
        <Link
          href="/iterations"
          style={{ color: "#6f5a8c", textDecoration: "none" }}
        >
          iteration previews
        </Link>
      </div>
    </div>
  );
}
