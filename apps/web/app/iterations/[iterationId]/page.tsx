import type { CSSProperties } from "react";
import { notFound } from "next/navigation";

const BG = "#f5edd6";
const VALID_IDS = new Set([
  "7",
  "10",
  "16",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
]);

function StumbleWin98() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Tahoma, Verdana, sans-serif",
        fontSize: "1.35rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "12px 36px",
        cursor: "pointer",
        background: "linear-gradient(180deg, #e8e8e8 0%, #b8b8b8 100%)",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#ffffff #404040 #404040 #ffffff",
        boxShadow: "inset 1px 1px 0 #dfdfdf, 2px 2px 0 rgba(0,0,0,0.25)",
        color: "#000",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration1Win98() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: BG,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #404040 #404040 #ffffff",
          boxShadow: "4px 4px 0 rgba(0,0,0,0.35)",
          fontFamily: "Tahoma, Verdana, sans-serif",
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
            color: "#fff",
            padding: "4px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 14,
                height: 14,
                background: "#c0c0c0",
                border: "1px solid #404040",
              }}
            />
            GeoStumble.exe
          </span>
          <span style={{ letterSpacing: 2 }}>— □ ×</span>
        </div>
        <div
          style={{
            padding: "6px 8px",
            background: "#c0c0c0",
            borderBottom: "2px solid #808080",
            fontSize: "0.75rem",
            color: "#000",
          }}
        >
          File Edit View Stumble Help
        </div>
        <div
          style={{
            padding: "28px 24px 32px",
            background: BG,
            border: "3px solid",
            borderColor: "#808080 #ffffff #ffffff #808080",
            margin: 10,
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "0.8rem",
              color: "#333",
            }}
          >
            Welcome to the Internet™ (circa 1999)
          </p>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "1.85rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#000080",
              textShadow: "1px 1px 0 #fff",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: "0.95rem",
              lineHeight: 1.45,
              color: "#2a2215",
            }}
          >
            Random Y2K homepages. One click. Pure chaos.
          </p>
          <StumbleWin98 />
        </div>
      </div>
    </div>
  );
}

function StumbleAqua() {
  return (
    <button
      type="button"
      style={{
        position: "relative",
        fontFamily: "Lucida Grande, Tahoma, sans-serif",
        fontSize: "1.25rem",
        fontWeight: 600,
        padding: "14px 48px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        color: "#fff",
        textShadow: "0 1px 0 rgba(0,0,0,0.35)",
        background: "linear-gradient(180deg, #6ecbff 0%, #0080ff 12%, #0066dd 88%, #0044aa 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 0 rgba(0,0,0,0.2), 0 4px 12px rgba(0,80,180,0.45)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          top: 4,
          height: "42%",
          borderRadius: 999,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative" }}>Stumble</span>
    </button>
  );
}

function Iteration2Aqua() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,255,255,0.85) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(0,128,255,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,100,180,0.08) 0%, transparent 40%), ${BG}`,
      }}
    >
      <div
        style={{
          width: "min(440px, 100%)",
          padding: "40px 36px 48px",
          borderRadius: 24,
          background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.35) 100%)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.95) inset, 0 18px 40px rgba(0,60,120,0.12), 0 2px 4px rgba(0,0,0,0.08)",
          textAlign: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontFamily: "Lucida Grande, Tahoma, sans-serif",
            fontSize: "0.75rem",
            color: "rgba(0,0,0,0.45)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Mac OS X — circa 2001
        </p>
        <h1
          style={{
            margin: "0 0 12px",
            fontFamily: "Lucida Grande, Tahoma, sans-serif",
            fontSize: "2.4rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            background: "linear-gradient(180deg, #1a1a1a 0%, #4a4a4a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          GeoStumble
        </h1>
        <p
          style={{
            margin: "0 0 32px",
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.5,
            color: "#3d3428",
          }}
        >
          Glossy buttons. Questionable gradients. The future felt squishy.
        </p>
        <StumbleAqua />
      </div>
    </div>
  );
}

function Screw() {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #e8e8e8, #6a6a6a)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.5)",
        border: "1px solid #555",
      }}
    />
  );
}

function StumbleMetal() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Verdana, sans-serif",
        fontSize: "1.1rem",
        fontWeight: 700,
        padding: "12px 32px",
        cursor: "pointer",
        borderRadius: 6,
        border: "1px solid #2a2a2a",
        color: "#f0f0f0",
        textShadow: "0 -1px 0 #000",
        background: "linear-gradient(180deg, #6a6a6a 0%, #3a3a3a 45%, #2a2a2a 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.35)",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration3Metal() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: BG,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(500px, 100%)",
          padding: "36px 32px 40px",
          borderRadius: 12,
          background: `repeating-linear-gradient(
            -12deg,
            #9a9a9a 0px,
            #b5b5b5 2px,
            #8e8e8e 4px,
            #a8a8a8 6px
          )`,
          border: "1px solid #666",
          boxShadow:
            "inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 8px rgba(0,0,0,0.25), 0 12px 28px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Screw />
            <Screw />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Screw />
            <Screw />
          </div>
        </div>
        <div
          style={{
            position: "relative",
            padding: "28px 20px",
            borderRadius: 8,
            background: "linear-gradient(180deg, #d4cfc4 0%, #c8c2b4 100%)",
            border: "2px ridge rgba(255,255,255,0.7)",
            textAlign: "center",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "#555",
              textTransform: "uppercase",
            }}
          >
            QuickTime™ Presentation
          </p>
          <h1
            style={{
              margin: "0 0 10px",
              fontFamily: "Impact, Haettenschweiler, sans-serif",
              fontSize: "2.5rem",
              letterSpacing: "0.02em",
              color: "#1a1510",
              textShadow: "1px 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            GeoStumble
          </h1>
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              marginBottom: 20,
              borderRadius: 4,
              fontFamily: "Courier New, monospace",
              fontSize: "0.85rem",
              background: "#2d3b2d",
              color: "#7fff7f",
              border: "2px inset #1a221a",
              boxShadow: "inset 0 0 8px rgba(0,255,100,0.15)",
            }}
          >
            ● READY TO SURF — insert CD-ROM nostalgia
          </div>
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              color: "#2a2218",
            }}
          >
            Brushed aluminum chrome. The kind of skeuomorphism that could cut
            paper.
          </p>
          <StumbleMetal />
        </div>
      </div>
    </div>
  );
}

function StumblePlastic() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Comic Sans MS, Comic Sans, cursive",
        fontSize: "1.5rem",
        fontWeight: 700,
        padding: "16px 40px",
        cursor: "pointer",
        borderRadius: 20,
        border: "4px solid",
        borderColor: "#ff69b4 #c71585 #c71585 #ff69b4",
        color: "#fff",
        textShadow: "0 2px 0 rgba(0,0,0,0.25)",
        background: "linear-gradient(180deg, #ff8dc7 0%, #ff1493 45%, #c71585 100%)",
        boxShadow:
          "inset 0 4px 0 rgba(255,255,255,0.35), inset 0 -4px 0 rgba(0,0,0,0.15), 0 6px 0 #8b0a50, 0 10px 18px rgba(199,21,133,0.45)",
        transform: "translateY(0)",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration4Plastic() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `linear-gradient(135deg, #fff8e7 0%, ${BG} 40%, #ffe4f0 100%)`,
      }}
    >
      <div
        style={{
          width: "min(480px, 100%)",
          padding: "8px",
          borderRadius: 28,
          background: "linear-gradient(145deg, #ffff00, #ff6600, #00ccff, #cc00ff)",
          boxShadow: "0 12px 0 #5a189a, 0 18px 32px rgba(90,24,154,0.35)",
        }}
      >
        <div
          style={{
            borderRadius: 22,
            padding: "32px 28px 40px",
            background: BG,
            border: "4px solid #f0d090",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "2.6rem",
              fontWeight: 900,
              lineHeight: 1,
              background: "linear-gradient(180deg, #ff00ff 0%, #6600ff 50%, #00ccff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(2px 2px 0 #fff)",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "1rem",
              color: "#553311",
            }}
          >
            The big plastic toy button era. Parents hated the noise. We loved it.
          </p>
          <StumblePlastic />
        </div>
      </div>
    </div>
  );
}

function StumbleGeo() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Impact, sans-serif",
        fontSize: "1.6rem",
        letterSpacing: "0.08em",
        padding: "14px 36px",
        cursor: "pointer",
        background: "linear-gradient(180deg, #ffff33 0%, #ff9900 100%)",
        border: "4px outset #ffcc00",
        color: "#660000",
        textShadow: "1px 1px 0 #fff5c2",
        boxShadow: "3px 3px 0 #000",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration5GeoCities() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: BG,
      }}
    >
      <div
        style={{
          border: "6px ridge #cc0000",
          background: "#fffef8",
          maxWidth: 640,
          margin: "0 auto",
          boxShadow: "6px 6px 0 #000",
        }}
      >
        <div
          style={{
            background: "#000080",
            color: "#00ff00",
            fontFamily: "Courier New, monospace",
            fontSize: "0.75rem",
            padding: "6px 8px",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              display: "inline-block",
              animation: "geostumble-marquee 14s linear infinite",
            }}
          >
            ★ WELCOME 2 MY HOMEPAGE ★ YOU ARE VISITOR NUMBER 000047 ★ BEST VIEWED IN
            NETSCAPE 4.7 ★ SIGN MY GUESTBOOK ★ GEOSTUMBLE 4 EVA ★
          </div>
        </div>
        <div style={{ padding: "24px 20px 32px", textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 6px",
              fontFamily: "Impact, sans-serif",
              fontSize: "2.8rem",
              color: "#0000cc",
              textShadow: "3px 3px 0 #ff00ff, 6px 6px 0 #00ffff",
              animation: "geostumble-blink 1.2s step-end infinite",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "1rem",
              color: "#006600",
            }}
          >
            ~*~ click da button 2 get lost on purpose ~*~
          </p>
          <p
            style={{
              margin: "0 0 20px",
              fontFamily: "Courier New, monospace",
              fontSize: "0.85rem",
              color: "#333",
            }}
          >
            [ under construction — always ]
          </p>
          <div style={{ marginBottom: 20 }}>
            <StumbleGeo />
          </div>
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              padding: "8px 12px",
              background: "#111",
              border: "3px inset #444",
              fontFamily: "'Times New Roman', serif",
              fontSize: "1.1rem",
              color: "#ff3333",
            }}
          >
            {"0040217".split("").map((d, i) => (
              <span
                key={`${d}-${i}`}
                style={{
                  background: "#220000",
                  padding: "2px 6px",
                  border: "1px solid #550000",
                  color: "#ff6666",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** OG Xbox: black industrial shell, acid green glow, papyrus inset “scroll”. */
function StumbleXboxClassic() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Tahoma, Verdana, sans-serif",
        fontSize: "1.2rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "14px 40px",
        cursor: "pointer",
        color: "#0a1f0a",
        background: "linear-gradient(180deg, #b8ff5c 0%, #6ecf00 45%, #3d8c00 100%)",
        border: "3px solid #1a3d0a",
        borderRadius: 4,
        boxShadow:
          "0 0 0 1px #c8ff80, 0 0 24px rgba(110,207,0,0.55), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.25)",
        textShadow: "0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration6XboxOdyssey() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "radial-gradient(ellipse at 50% 0%, #1a3d14 0%, #070b06 55%, #000 100%)",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          padding: 3,
          borderRadius: 6,
          background: "linear-gradient(145deg, #3a3a3a, #0a0a0a)",
          boxShadow: "0 0 0 2px #1f1f1f, 0 24px 48px rgba(0,0,0,0.65), 0 0 60px rgba(110,207,0,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 16px",
            background: "linear-gradient(90deg, #111 0%, #1c1c1c 100%)",
            borderBottom: "1px solid #000",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "radial-gradient(circle at 32% 28%, #dfff9a 0%, #6ecf00 42%, #1a4d00 100%)",
              boxShadow:
                "inset 0 -4px 8px rgba(0,0,0,0.45), inset 0 3px 6px rgba(255,255,255,0.35), 0 0 20px rgba(110,207,0,0.4)",
            }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "Tahoma, sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "#6ecf00",
                textTransform: "uppercase",
              }}
            >
              Xbox — 2001
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: "Impact, sans-serif",
                fontSize: "1.35rem",
                letterSpacing: "0.04em",
                color: "#e8e8e8",
              }}
            >
              GEOSTUMBLE
            </p>
          </div>
        </div>
        <div
          style={{
            padding: "28px 24px 32px",
            background: BG,
            textAlign: "center",
            border: "2px solid #2a2a2a",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "Georgia, serif",
              fontSize: "1.05rem",
              fontStyle: "italic",
              color: "#3d2f1f",
              lineHeight: 1.55,
            }}
          >
            Insert the next disc of your odyssey — a random shore, a stranger&apos;s
            hall, a homepage that wasn&apos;t meant to load this fast.
          </p>
          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "Tahoma, sans-serif",
              fontSize: "0.8rem",
              color: "#5c4a38",
              letterSpacing: "0.08em",
            }}
          >
            PRESS START ON THE UNKNOWN
          </p>
          <StumbleXboxClassic />
        </div>
      </div>
    </div>
  );
}

function StumbleBronze() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "1.2rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        padding: "14px 38px",
        cursor: "pointer",
        color: "#2a1810",
        background: "linear-gradient(180deg, #d4a574 0%, #8b5a2b 50%, #5c3d1e 100%)",
        border: "3px solid",
        borderColor: "#f0d4a8 #5c3d1e #3d2814 #e8c9a0",
        borderRadius: 4,
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.35), 0 4px 0 #3d2814",
        textShadow: "0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      Stumble
    </button>
  );
}

/** Unrolled scroll: Ithaca energy, papyrus field, bronze rivet corners. */
function Iteration7Scroll() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: `linear-gradient(180deg, #c4a574 0%, ${BG} 18%, ${BG} 82%, #8b7355 100%)`,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          position: "relative",
          padding: "36px 32px 40px",
          background: BG,
          border: "3px double #5c4a38",
          boxShadow:
            "0 0 0 1px #e8dcc4, 8px 8px 0 rgba(44,36,24,0.15), inset 0 0 80px rgba(196,165,116,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <p
          style={{
            margin: "0 0 6px",
            fontFamily: "Georgia, serif",
            fontSize: "0.85rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#6b5344",
          }}
        >
          Book I — The Open Sea
        </p>
        <h1
          style={{
            margin: "0 0 16px",
            fontFamily: "Palatino, Georgia, serif",
            fontSize: "2.5rem",
            fontWeight: 400,
            color: "#2a1810",
            letterSpacing: "-0.02em",
          }}
        >
          GeoStumble
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: "#3d2f22",
          }}
        >
          Let the west wind carry you where algorithms fear to thread — island
          after island of Y2K shores, sirens optional, guestbook required.
        </p>
        <div style={{ textAlign: "center" }}>
          <StumbleBronze />
        </div>
      </div>
    </div>
  );
}

function StumbleXboxSilver() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Segoe UI, Tahoma, sans-serif",
        fontSize: "1.05rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "12px 36px",
        cursor: "pointer",
        color: "#f5f5f5",
        background: "linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)",
        border: "2px solid #6ecf00",
        borderRadius: 2,
        boxShadow:
          "0 0 12px rgba(110,207,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      Stumble
    </button>
  );
}

/** Blade-era silver rails + papyrus hero — “choose your voyage”. */
function Iteration8Blades() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 40%, #141414 100%)`,
        padding: "28px 20px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          border: "1px solid #333",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "linear-gradient(90deg, #6ecf00 0%, #4a9c00 100%)",
          }}
        >
          {["Home", "Discover", "Adventure"].map((label, i) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontFamily: "Segoe UI, Tahoma, sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textAlign: "center",
                color: i === 2 ? "#0a1a0a" : "rgba(10,26,10,0.55)",
                background:
                  i === 2 ? "rgba(255,255,255,0.35)" : "transparent",
                borderRight: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div style={{ padding: 0, background: BG }}>
          <div style={{ padding: "32px 28px 36px", textAlign: "center" }}>
            <h1
              style={{
                margin: "0 0 8px",
                fontFamily: "Georgia, serif",
                fontSize: "2.35rem",
                color: "#2a1810",
              }}
            >
              GeoStumble
            </h1>
            <p
              style={{
                margin: "0 0 24px",
                fontFamily: "Segoe UI, Tahoma, sans-serif",
                fontSize: "0.95rem",
                lineHeight: 1.55,
                color: "#4a3d2e",
              }}
            >
              The dashboard of a thousand harbors. One green-lit choice sends you
              onward — no map, no mercy, just the next strange homepage.
            </p>
            <StumbleXboxSilver />
          </div>
        </div>
      </div>
    </div>
  );
}

function StumbleSeaLantern() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "1.15rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "14px 40px",
        cursor: "pointer",
        color: BG,
        background: "linear-gradient(180deg, #1e4d6b 0%, #0f2d44 100%)",
        border: "3px solid #c9a06c",
        borderRadius: 6,
        boxShadow:
          "0 0 20px rgba(201,160,108,0.45), inset 0 2px 0 rgba(255,255,255,0.12)",
        textShadow: "0 1px 2px #000",
      }}
    >
      Stumble
    </button>
  );
}

/** Wine-dark sea around a floating papyrus “raft” — Odyssey night crossing. */
function Iteration9WineDarkSea() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `radial-gradient(ellipse 120% 80% at 50% 120%, #0a1628 0%, #1b3a52 35%, #0d2137 70%, #050a12 100%)`,
      }}
    >
      <div
        style={{
          width: "min(500px, 100%)",
          padding: "36px 28px 40px",
          background: BG,
          border: "4px solid #c9a06c",
          borderRadius: 2,
          textAlign: "center",
          boxShadow:
            "0 0 0 2px rgba(26,58,82,0.5), 0 24px 60px rgba(0,0,0,0.55), inset 0 0 40px rgba(201,160,108,0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "Georgia, serif",
            fontSize: "0.8rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#6b5344",
          }}
        >
          Ὀδύσσεια — a detour
        </p>
        <h1
          style={{
            margin: "0 0 16px",
            fontFamily: "Palatino, Georgia, serif",
            fontSize: "2.4rem",
            color: "#1a2f45",
          }}
        >
          GeoStumble
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.65,
            color: "#3d3428",
          }}
        >
          The sea is wide; the tabs are many. Trust the button like a night
          lantern — it marks the next island without promising safe harbor.
        </p>
        <StumbleSeaLantern />
      </div>
    </div>
  );
}

function StumbleCompass() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Palatino, Georgia, serif",
        fontSize: "1.2rem",
        fontWeight: 700,
        padding: "14px 36px",
        cursor: "pointer",
        color: "#1a1208",
        background: `linear-gradient(180deg, ${BG} 0%, #e8dcc8 100%)`,
        border: "4px ridge #8b6914",
        borderRadius: "50%",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.8), 0 6px 0 #5c4a28, 0 8px 16px rgba(0,0,0,0.2)",
      }}
    >
      Stumble
    </button>
  );
}

/** Treasure-map papyrus: dashed route, X, compass-styled CTA. */
function Iteration10TreasureMap() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `linear-gradient(135deg, #d4c4a8 0%, ${BG} 45%, #c9b896 100%)`,
      }}
    >
      <div
        style={{
          width: "min(540px, 100%)",
          minHeight: 420,
          position: "relative",
          padding: "36px 28px 40px",
          backgroundColor: BG,
          border: "2px solid #7a6a50",
          boxShadow: "4px 4px 0 #5c4a38, 12px 12px 24px rgba(44,36,24,0.2)",
          backgroundImage: `
            linear-gradient(90deg, rgba(90,74,56,0.06) 1px, transparent 1px),
            linear-gradient(rgba(90,74,56,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "42%",
            left: "18%",
            right: "22%",
            height: 0,
            borderTop: "3px dashed #8b4513",
            opacity: 0.65,
            transform: "rotate(-8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "28%",
            right: "20%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.8rem",
            color: "#b22222",
            transform: "rotate(12deg)",
            textShadow: "1px 1px 0 #fff",
          }}
        >
          X
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "Georgia, serif",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: "#6b5344",
            }}
          >
            Here there be homepages
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.6rem",
              color: "#3d2914",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "#4a3d2e",
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Every click is another leg of the journey — Circe&apos;s pop-ups,
            Calypso&apos;s MIDI, and maybe, if the Fates allow, a hit counter
            still ticking.
          </p>
          <StumbleCompass />
        </div>
      </div>
    </div>
  );
}

/** Scroll kin to 7 — later book, cooler parchment margin, same bronze studs. */
function Iteration11ScrollLaterBook() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: `linear-gradient(180deg, #a89078 0%, ${BG} 14%, ${BG} 86%, #6e5c48 100%)`,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          position: "relative",
          padding: "40px 34px 44px",
          background: BG,
          border: "3px double #4a3d2e",
          boxShadow:
            "0 0 0 1px #f2e6d4, 10px 10px 0 rgba(44,36,24,0.12), inset 0 0 100px rgba(160,130,96,0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #c9a06c, #4a3020)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <p
          style={{
            margin: "0 0 6px",
            fontFamily: "Georgia, serif",
            fontSize: "0.85rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#5c4a38",
          }}
        >
          Book XII — Landfall
        </p>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "Palatino, Georgia, serif",
            fontSize: "2.45rem",
            fontWeight: 400,
            color: "#2a1810",
          }}
        >
          GeoStumble
        </h1>
        <p
          style={{
            margin: "0 0 20px",
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: "0.9rem",
            letterSpacing: "0.4em",
            color: "#8b7355",
          }}
        >
          ◇ ─────── ◇ ─────── ◇
        </p>
        <p
          style={{
            margin: "0 0 28px",
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "#3d2f22",
          }}
        >
          The oars rest; the anchor drags through static. One more harbor —
          chosen by chance, not by chart — and you are ashore in someone
          else&apos;s story.
        </p>
        <div style={{ textAlign: "center" }}>
          <StumbleBronze />
        </div>
      </div>
    </div>
  );
}

/** Map kin to 10 — nautical chart, compass rose, serpentine dashed track. */
function Iteration12NauticalChart() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `linear-gradient(165deg, #8fafc4 0%, ${BG} 38%, #c9b896 92%)`,
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          minHeight: 440,
          position: "relative",
          padding: "38px 30px 42px",
          backgroundColor: BG,
          border: "3px solid #1a3550",
          boxShadow:
            "inset 0 0 0 2px #c9a06c, 6px 6px 0 #0d2137, 16px 16px 32px rgba(13,33,55,0.25)",
          backgroundImage: `
            linear-gradient(90deg, rgba(26,53,80,0.05) 1px, transparent 1px),
            linear-gradient(rgba(26,53,80,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "2px solid #5c4a38",
            background: `radial-gradient(circle, ${BG} 30%, transparent 31%),
              repeating-conic-gradient(from 0deg, #5c4a38 0deg 2deg, transparent 2deg 8deg)`,
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "36%",
            left: "12%",
            width: "55%",
            height: "22%",
            border: "3px dashed transparent",
            borderImage: "none",
            borderTop: "3px dashed #6b4423",
            borderRadius: "40% 60% 50% 50% / 45% 45% 55% 55%",
            opacity: 0.7,
            transform: "rotate(-6deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: "20%",
            fontSize: "1.4rem",
            color: "#1a3550",
            opacity: 0.55,
            transform: "rotate(-18deg)",
          }}
        >
          ⚓
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "Georgia, serif",
              fontSize: "0.72rem",
              letterSpacing: "0.28em",
              color: "#1a3550",
            }}
          >
            Chart of the Known Weird
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.5rem",
              color: "#2a1810",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.65,
              color: "#3d3428",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Soundings unknown. Monsters probable. Carry a bookmark like a
            dagger — you will need it when the current pulls you sideways.
          </p>
          <StumbleBronze />
        </div>
      </div>
    </div>
  );
}

function StumbleWaxSeal() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "1rem",
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "18px 28px",
        cursor: "pointer",
        color: "#f5edd6",
        background: "radial-gradient(ellipse at 35% 25%, #c94c4c 0%, #6b1414 70%, #3d0a0a 100%)",
        border: "3px solid #4a0f0f",
        borderRadius: "50%",
        minWidth: 132,
        minHeight: 132,
        boxShadow:
          "inset 0 3px 8px rgba(255,255,255,0.15), inset 0 -4px 12px rgba(0,0,0,0.45), 0 6px 0 #2a0808, 0 10px 20px rgba(0,0,0,0.25)",
        textShadow: "0 1px 2px #000",
        lineHeight: 1.3,
      }}
    >
      Stumble
    </button>
  );
}

/** Stele / inscription — stone frame, papyrus field, formal Odyssey cadence. */
function Iteration13MarbleStele() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 20px",
        background: `linear-gradient(180deg, #6b6b68 0%, #9a9a96 20%, ${BG} 100%)`,
      }}
    >
      <div
        style={{
          width: "min(480px, 100%)",
          padding: 14,
          background: "linear-gradient(145deg, #b8b8b4 0%, #7a7a76 100%)",
          border: "2px solid #5a5a56",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.35), 0 12px 28px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "36px 30px 40px",
            background: BG,
            border: "2px solid #5c4a38",
            textAlign: "center",
            boxShadow: "inset 0 0 60px rgba(90,74,56,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "Georgia, serif",
              fontSize: "0.7rem",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "#6b5344",
            }}
          >
            Inscribed for wayfarers
          </p>
          <h1
            style={{
              margin: "0 0 16px",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.35rem",
              color: "#2a1810",
              fontWeight: 400,
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              fontFamily: "Georgia, serif",
              fontSize: "1.02rem",
              lineHeight: 1.75,
              color: "#3d2f22",
              fontStyle: "italic",
            }}
          >
            Sing, Muse, of the cursor that knew no master — only the next
            page, the stranger&apos;s flame, the guestbook where mortals left
            their names in Comic Sans.
          </p>
          <StumbleBronze />
        </div>
      </div>
    </div>
  );
}

/** Archipelago map — island blobs, twin routes, compass CTA. */
function Iteration14Archipelago() {
  const island = (style: CSSProperties) => (
    <div
      style={{
        position: "absolute",
        borderRadius: "50% 45% 52% 48%",
        background:
          "radial-gradient(ellipse at 40% 35%, #d4b896 0%, #a08060 55%, #7a6048 100%)",
        border: "2px solid #5c4a38",
        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.25)",
        ...style,
      }}
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: `linear-gradient(125deg, #e8dcc8 0%, ${BG} 50%, #d4c4a8 100%)`,
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          minHeight: 460,
          position: "relative",
          padding: "40px 28px 44px",
          backgroundColor: BG,
          border: "2px solid #6b5344",
          boxShadow: "5px 5px 0 #4a3d2e, 14px 14px 28px rgba(44,36,24,0.18)",
          backgroundImage: `
            linear-gradient(90deg, rgba(107,83,68,0.055) 1px, transparent 1px),
            linear-gradient(rgba(107,83,68,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
        }}
      >
        {island({ width: 56, height: 48, top: "14%", left: "12%" })}
        {island({ width: 72, height: 58, top: "22%", right: "16%" })}
        {island({ width: 48, height: 44, bottom: "28%", left: "20%" })}
        {island({ width: 64, height: 52, bottom: "18%", right: "22%" })}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "22%",
            right: "30%",
            height: 0,
            borderTop: "2px dashed #8b4513",
            opacity: 0.55,
            transform: "rotate(12deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "18%",
            width: "40%",
            height: 0,
            borderTop: "2px dashed #a0522d",
            opacity: 0.5,
            transform: "rotate(-18deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "42%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.5rem",
            color: "#8b0000",
            transform: "rotate(-8deg)",
          }}
        >
          X
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "36%",
            right: "28%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.35rem",
            color: "#8b0000",
            transform: "rotate(15deg)",
          }}
        >
          X
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "Georgia, serif",
              fontSize: "0.74rem",
              letterSpacing: "0.22em",
              color: "#6b5344",
            }}
          >
            Isles of the blessed dial-up
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.55rem",
              color: "#3d2914",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "#4a3d2e",
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Hop skerry to skerry across the old web — no crew, no cargo, only
            curiosity and a stubborn refusal to use the back button.
          </p>
          <StumbleCompass />
        </div>
      </div>
    </div>
  );
}

/** Scroll meets seal — rolled top shadow, ribbon line, wax Stumble. */
function Iteration15RibbonAndSeal() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "44px 24px",
        background: `linear-gradient(180deg, #8b7355 0%, ${BG} 25%, ${BG} 75%, #a89078 100%)`,
      }}
    >
      <div style={{ width: "min(520px, 100%)", position: "relative" }}>
        <div
          style={{
            height: 18,
            margin: "0 24px",
            borderRadius: "8px 8px 0 0",
            background: "linear-gradient(180deg, #d4c4a8 0%, #a89078 100%)",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.12)",
            border: "2px solid #6b5344",
            borderBottom: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "38px 32px 44px",
            background: BG,
            border: "3px double #5c4a38",
            boxShadow:
              "0 0 0 1px #f2e6d4, 0 14px 28px rgba(44,36,24,0.14), inset 0 0 90px rgba(196,165,116,0.1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -3,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(200px, 55%)",
              height: 10,
              background: "linear-gradient(90deg, #6b1414 0%, #a02020 50%, #6b1414 100%)",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
          <p
            style={{
              margin: "8px 0 6px",
              fontFamily: "Georgia, serif",
              fontSize: "0.82rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#6b5344",
              textAlign: "center",
            }}
          >
            Book VI — The Phaeacian Wi-Fi
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.5rem",
              fontWeight: 400,
              color: "#2a1810",
              textAlign: "center",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 26px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
              color: "#8b7355",
              letterSpacing: "0.15em",
            }}
          >
            ——— ♦ ——— ♦ ———
          </p>
          <p
            style={{
              margin: "0 0 32px",
              fontFamily: "Georgia, serif",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "#3d2f22",
              textAlign: "center",
            }}
          >
            The king&apos;s hall glows with CRT; the bard sings of iframes.
            Break the seal when you are ready to be shipwrecked somewhere
            wonderful.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StumbleWaxSeal />
          </div>
        </div>
      </div>
    </div>
  );
}

function StumbleGemCompass() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Trebuchet MS, Tahoma, sans-serif",
        fontSize: "1.05rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "14px 34px",
        cursor: "pointer",
        color: "#2a1810",
        background:
          "linear-gradient(135deg, #00d5ff 0%, #48f7ff 18%, #ff62cf 82%, #9c22ff 100%)",
        border: "3px solid #fff6dc",
        borderRadius: 999,
        boxShadow:
          "0 0 0 3px #213c6b, 0 8px 0 #5a216f, 0 12px 24px rgba(33,60,107,0.28), inset 0 2px 0 rgba(255,255,255,0.65)",
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      Stumble
    </button>
  );
}

function StumbleRoyalSeal() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "1rem",
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        padding: "18px 26px",
        cursor: "pointer",
        color: "#fff5dc",
        background:
          "radial-gradient(ellipse at 35% 25%, #dba7ff 0%, #8a2be2 50%, #4b0f7a 100%)",
        border: "4px solid #2d0852",
        borderRadius: "50%",
        minWidth: 138,
        minHeight: 138,
        boxShadow:
          "inset 0 3px 10px rgba(255,255,255,0.22), inset 0 -6px 14px rgba(0,0,0,0.42), 0 6px 0 #20043b, 0 12px 22px rgba(75,15,122,0.3)",
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        lineHeight: 1.3,
      }}
    >
      Stumble
    </button>
  );
}

function StumbleHeartSeal() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Verdana, sans-serif",
        fontSize: "0.98rem",
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "18px 24px",
        cursor: "pointer",
        color: "#fffdf8",
        background:
          "radial-gradient(ellipse at 35% 25%, #ffb3d9 0%, #ff4fa2 48%, #b10059 100%)",
        border: "4px solid #7a003d",
        borderRadius: "50%",
        minWidth: 138,
        minHeight: 138,
        boxShadow:
          "inset 0 3px 10px rgba(255,255,255,0.24), inset 0 -6px 14px rgba(0,0,0,0.36), 0 6px 0 #60002f, 0 12px 22px rgba(177,0,89,0.28)",
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        lineHeight: 1.3,
      }}
    >
      Stumble
    </button>
  );
}

function StumbleStarSeal() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Trebuchet MS, Tahoma, sans-serif",
        fontSize: "1rem",
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "18px 24px",
        cursor: "pointer",
        color: "#fffef5",
        background:
          "radial-gradient(ellipse at 35% 25%, #b5ffff 0%, #1fd4ff 46%, #0056b8 100%)",
        border: "4px solid #00356e",
        borderRadius: "50%",
        minWidth: 138,
        minHeight: 138,
        boxShadow:
          "inset 0 3px 10px rgba(255,255,255,0.24), inset 0 -6px 14px rgba(0,0,0,0.38), 0 6px 0 #00264d, 0 12px 22px rgba(0,86,184,0.3)",
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        lineHeight: 1.3,
      }}
    >
      Stumble
    </button>
  );
}

/** Iteration 12 remix: hot-chart glam with stickers, stars, and gem compass CTA. */
function Iteration16StarChartDeluxe() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background:
          "linear-gradient(145deg, #07152a 0%, #183b69 35%, #ffb3e2 100%)",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          minHeight: 450,
          position: "relative",
          padding: "38px 30px 44px",
          backgroundColor: BG,
          border: "3px solid #183b69",
          boxShadow:
            "inset 0 0 0 2px #ff74cf, 6px 6px 0 #07152a, 18px 18px 36px rgba(7,21,42,0.28)",
          backgroundImage: `
            linear-gradient(90deg, rgba(24,59,105,0.06) 1px, transparent 1px),
            linear-gradient(rgba(24,59,105,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            padding: "6px 10px",
            background: "linear-gradient(180deg, #fff76a 0%, #ffa000 100%)",
            border: "2px solid #8b3f00",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.82rem",
            letterSpacing: "0.06em",
            color: "#6b1a00",
            transform: "rotate(-10deg)",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.18)",
          }}
        >
          NEW ROUTE!
        </div>
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 26,
            padding: "6px 10px",
            background: "linear-gradient(180deg, #66f7ff 0%, #00a0ff 100%)",
            border: "2px solid #183b69",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.82rem",
            letterSpacing: "0.06em",
            color: "#fff",
            transform: "rotate(8deg)",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.18)",
          }}
        >
          TOP MAP
        </div>
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 22,
            width: 86,
            height: 86,
            borderRadius: "50%",
            border: "3px solid #183b69",
            background: `radial-gradient(circle, ${BG} 28%, transparent 29%),
              repeating-conic-gradient(from 0deg, #183b69 0deg 2deg, transparent 2deg 10deg)`,
            opacity: 0.8,
          }}
        />
        {[
          { top: "24%", left: "18%", color: "#ff62cf" },
          { top: "32%", right: "22%", color: "#00cfff" },
          { bottom: "28%", left: "16%", color: "#ff9f1a" },
          { bottom: "20%", right: "18%", color: "#8a2be2" },
        ].map(({ color, ...star }, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              fontFamily: "Impact, sans-serif",
              fontSize: "1.6rem",
              lineHeight: 1,
              color,
              textShadow: "1px 1px 0 #fff",
              ...star,
            }}
          >
            *
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            top: "42%",
            left: "14%",
            right: "24%",
            height: 0,
            borderTop: "3px dashed #ff4fa2",
            opacity: 0.72,
            transform: "rotate(-8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24%",
            left: "22%",
            width: "36%",
            height: 0,
            borderTop: "3px dashed #00cfff",
            opacity: 0.66,
            transform: "rotate(16deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "46%",
            right: "19%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.7rem",
            color: "#b10059",
            transform: "rotate(10deg)",
            textShadow: "1px 1px 0 #fff",
          }}
        >
          X
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.76rem",
              letterSpacing: "0.22em",
              color: "#183b69",
            }}
          >
            Treasure Chart 2000 Deluxe Edition
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontFamily: "Impact, sans-serif",
              fontSize: "2.8rem",
              letterSpacing: "0.03em",
              color: "#23325f",
              textShadow: "2px 2px 0 #fff, 4px 4px 0 #ff62cf",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.65,
              color: "#3d3428",
            }}
          >
            Plot a course past midi reefs, glitter coves, and pages so extra
            they need their own legend. This chart comes with zero restraint.
          </p>
          <StumbleGemCompass />
        </div>
      </div>
    </div>
  );
}

/** Iteration 12 remix: treasure map turned teen-magazine spread. */
function Iteration17PiratePopMap() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background:
          "linear-gradient(160deg, #77d8ff 0%, #f5edd6 42%, #ffd27a 100%)",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          minHeight: 450,
          position: "relative",
          padding: "40px 30px 42px",
          backgroundColor: BG,
          border: "3px solid #8b4513",
          boxShadow:
            "inset 0 0 0 2px #ff5f1f, 6px 6px 0 #183b69, 16px 16px 28px rgba(24,59,105,0.2)",
          backgroundImage: `
            linear-gradient(90deg, rgba(139,69,19,0.06) 1px, transparent 1px),
            linear-gradient(rgba(139,69,19,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "26px 26px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 24,
            padding: "5px 12px",
            background: "linear-gradient(180deg, #ff74cf 0%, #ff1f91 100%)",
            border: "2px solid #7a0042",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.8rem",
            color: "#fffaf2",
            transform: "rotate(-8deg)",
          }}
        >
          HOT SITE
        </div>
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            padding: "5px 12px",
            background: "linear-gradient(180deg, #fff76a 0%, #ff9f1a 100%)",
            border: "2px solid #8b3f00",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.8rem",
            color: "#6b1a00",
            transform: "rotate(6deg)",
          }}
        >
          WOW
        </div>
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "16%",
            width: 68,
            height: 54,
            borderRadius: "50% 48% 52% 46%",
            background:
              "radial-gradient(ellipse at 40% 35%, #d4b896 0%, #a08060 55%, #7a6048 100%)",
            border: "2px solid #5c4a38",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "18%",
            right: "16%",
            width: 82,
            height: 62,
            borderRadius: "48% 52% 46% 54%",
            background:
              "radial-gradient(ellipse at 40% 35%, #d4b896 0%, #a08060 55%, #7a6048 100%)",
            border: "2px solid #5c4a38",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "34%",
            left: "24%",
            width: "44%",
            height: 0,
            borderTop: "3px dashed #8b4513",
            opacity: 0.68,
            transform: "rotate(8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            left: "32%",
            width: "26%",
            height: 0,
            borderTop: "3px dashed #ff1f91",
            opacity: 0.58,
            transform: "rotate(-20deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "18%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.6rem",
            color: "#ff1f91",
            textShadow: "1px 1px 0 #fff",
          }}
        >
          X
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "26%",
            left: "18%",
            fontFamily: "Impact, sans-serif",
            fontSize: "1.45rem",
            color: "#00a0ff",
            textShadow: "1px 1px 0 #fff",
          }}
        >
          X
        </div>
        <div style={{ position: "relative", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "0.95rem",
              color: "#8b4513",
            }}
          >
            Captain&apos;s Treasure Planner feat. surprise detours
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontFamily: "Impact, sans-serif",
              fontSize: "2.85rem",
              color: "#3d2914",
              textShadow: "2px 2px 0 #fff, 4px 4px 0 #77d8ff",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.65,
              color: "#4a3d2e",
            }}
          >
            Equal parts pirate atlas and mall-kiosk CD-ROM cover. Every X is a
            homepage, every homepage is dramatic, and yes, the sea is glitter.
          </p>
          <StumbleGemCompass />
        </div>
      </div>
    </div>
  );
}

/** Iteration 12 remix: chart UI pushed into cyber-nautical console camp. */
function Iteration18ChartConsole() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #26134d 0%, #0d2c57 34%, #f5edd6 100%)",
        padding: "28px 20px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          border: "2px solid #00d5ff",
          boxShadow: "0 0 0 2px #ff62cf, 0 18px 36px rgba(13,44,87,0.35)",
          overflow: "hidden",
          background: "#132445",
        }}
      >
        <div
          style={{
            display: "flex",
            background:
              "linear-gradient(90deg, #00d5ff 0%, #48f7ff 20%, #ff62cf 80%, #9c22ff 100%)",
          }}
        >
          {["MAP", "ALERT", "TREASURE"].map((label, index) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "10px 12px",
                textAlign: "center",
                fontFamily: "Impact, sans-serif",
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                color: index === 2 ? "#fffaf2" : "rgba(24,18,48,0.75)",
                background:
                  index === 2 ? "rgba(19,36,69,0.48)" : "rgba(255,255,255,0.22)",
                borderRight: "1px solid rgba(19,36,69,0.3)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "relative",
            minHeight: 420,
            padding: "34px 28px 40px",
            backgroundColor: BG,
            backgroundImage: `
              linear-gradient(90deg, rgba(0,213,255,0.05) 1px, transparent 1px),
              linear-gradient(rgba(255,98,207,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              width: 92,
              height: 92,
              borderRadius: "50%",
              border: "3px solid #183b69",
              background:
                "radial-gradient(circle, rgba(0,213,255,0.18) 0%, rgba(0,213,255,0.02) 55%, transparent 56%)",
              boxShadow: "inset 0 0 0 2px rgba(255,98,207,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "44%",
              left: "16%",
              right: "22%",
              height: 0,
              borderTop: "3px dashed #183b69",
              opacity: 0.68,
              transform: "rotate(-10deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "24%",
              left: "30%",
              width: "24%",
              height: 0,
              borderTop: "3px dashed #ff62cf",
              opacity: 0.7,
              transform: "rotate(18deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "28%",
              left: "18%",
              fontFamily: "Impact, sans-serif",
              fontSize: "1.55rem",
              color: "#00a0ff",
            }}
          >
            *
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "28%",
              right: "20%",
              fontFamily: "Impact, sans-serif",
              fontSize: "1.7rem",
              color: "#ff1f91",
            }}
          >
            X
          </div>
          <div style={{ position: "relative", textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 6px",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.74rem",
                letterSpacing: "0.24em",
                color: "#183b69",
              }}
            >
              NAVIGATION MODULE // CAMP MODE ON
            </p>
            <h1
              style={{
                margin: "0 0 14px",
                fontFamily: "Impact, sans-serif",
                fontSize: "2.7rem",
                color: "#2a1810",
                textShadow: "2px 2px 0 #fff, 4px 4px 0 #00d5ff",
              }}
            >
              GeoStumble
            </h1>
            <p
              style={{
                margin: "0 0 28px",
                maxWidth: 420,
                marginLeft: "auto",
                marginRight: "auto",
                fontFamily: "Georgia, serif",
                fontSize: "1rem",
                lineHeight: 1.65,
                color: "#3d3428",
              }}
            >
              A treasure chart if it were sold next to translucent iMac shells,
              chrome keychains, and software that promised to change your life.
            </p>
            <StumbleGemCompass />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Iteration 15 remix: royal invitation scroll dialed up to full princess-core. */
function Iteration19RoyalDecreeScroll() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "44px 24px",
        background:
          "linear-gradient(180deg, #4b2b73 0%, #c9a4ff 22%, #f5edd6 60%, #e3c5ff 100%)",
      }}
    >
      <div style={{ width: "min(540px, 100%)", position: "relative" }}>
        <div
          style={{
            height: 20,
            margin: "0 26px",
            borderRadius: "10px 10px 0 0",
            background: "linear-gradient(180deg, #f8d36c 0%, #c78a18 100%)",
            border: "2px solid #7a4b00",
            borderBottom: "none",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.15)",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "40px 34px 46px",
            background: BG,
            border: "3px double #6b5344",
            boxShadow:
              "0 0 0 2px #f5d88f, 0 18px 34px rgba(75,43,115,0.22), inset 0 0 90px rgba(201,164,255,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(230px, 58%)",
              height: 12,
              background:
                "linear-gradient(90deg, #8a2be2 0%, #dba7ff 50%, #8a2be2 100%)",
              borderRadius: 3,
              boxShadow: "0 2px 4px rgba(0,0,0,0.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 26,
              padding: "5px 10px",
              background: "linear-gradient(180deg, #fff76a 0%, #ffb11a 100%)",
              border: "2px solid #8b3f00",
              fontFamily: "Impact, sans-serif",
              fontSize: "0.78rem",
              color: "#6b1a00",
              transform: "rotate(-8deg)",
            }}
          >
            VIP PASS
          </div>
          <p
            style={{
              margin: "8px 0 6px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "0.82rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#6b5344",
            }}
          >
            Official Royal Surf Decree
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              textAlign: "center",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "2.7rem",
              fontWeight: 400,
              color: "#2a1810",
              textShadow: "2px 2px 0 #fff, 4px 4px 0 #dba7ff",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "0.9rem",
              color: "#8b7355",
              letterSpacing: "0.16em",
            }}
          >
            --- jewel edition --- jewel edition --- jewel edition ---
          </p>
          <p
            style={{
              margin: "0 0 32px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "1.04rem",
              lineHeight: 1.72,
              color: "#3d2f22",
            }}
          >
            By order of the House of Glitter, you are summoned to a homepage
            odyssey of velvet skies, dramatic page chrome, and guestbooks worthy
            of a coronation.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StumbleRoyalSeal />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Iteration 15 remix: bubblegum invitation scroll with peak mall-rat drama. */
function Iteration20ValentineInvitation() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "44px 24px",
        background:
          "linear-gradient(180deg, #ff96cf 0%, #f5edd6 42%, #b7e7ff 100%)",
      }}
    >
      <div style={{ width: "min(540px, 100%)", position: "relative" }}>
        <div
          style={{
            height: 18,
            margin: "0 26px",
            borderRadius: "10px 10px 0 0",
            background: "linear-gradient(180deg, #ffd3e9 0%, #ff7cbb 100%)",
            border: "2px solid #a30059",
            borderBottom: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "40px 34px 46px",
            background: BG,
            border: "3px double #a30059",
            boxShadow:
              "0 0 0 2px #ffd3e9, 0 18px 34px rgba(163,0,89,0.18), inset 0 0 90px rgba(183,231,255,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(230px, 58%)",
              height: 12,
              background:
                "linear-gradient(90deg, #ff4fa2 0%, #ffb3d9 50%, #66d8ff 100%)",
              borderRadius: 3,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 24,
              fontFamily: "Impact, sans-serif",
              fontSize: "1.25rem",
              color: "#ff4fa2",
              transform: "rotate(-12deg)",
              textShadow: "1px 1px 0 #fff",
            }}
          >
            *
          </div>
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 26,
              padding: "5px 10px",
              background: "linear-gradient(180deg, #fff76a 0%, #ff9f1a 100%)",
              border: "2px solid #8b3f00",
              fontFamily: "Impact, sans-serif",
              fontSize: "0.78rem",
              color: "#6b1a00",
              transform: "rotate(7deg)",
            }}
          >
            SO CUTE
          </div>
          <p
            style={{
              margin: "8px 0 6px",
              textAlign: "center",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "0.98rem",
              color: "#a30059",
            }}
          >
            U R invited 2 the internet&apos;s most dramatic quest
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              textAlign: "center",
              fontFamily: "Impact, sans-serif",
              fontSize: "2.75rem",
              color: "#5a216f",
              textShadow: "2px 2px 0 #fff, 4px 4px 0 #ffb3d9",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              textAlign: "center",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.84rem",
              color: "#8b7355",
              letterSpacing: "0.14em",
            }}
          >
            love letter / mixtape / scroll / treasure quest
          </p>
          <p
            style={{
              margin: "0 0 32px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "1.04rem",
              lineHeight: 1.72,
              color: "#3d2f22",
            }}
          >
            Somewhere between a chain-letter invitation and a prom-night map of
            the stars, this one begs you to click first and ask questions later.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StumbleHeartSeal />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Iteration 15 remix: oracle scroll with holographic ribbon and star seal. */
function Iteration21OracleInvitation() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "44px 24px",
        background:
          "linear-gradient(180deg, #00aac7 0%, #8feeff 18%, #f5edd6 54%, #dcb8ff 100%)",
      }}
    >
      <div style={{ width: "min(540px, 100%)", position: "relative" }}>
        <div
          style={{
            height: 20,
            margin: "0 26px",
            borderRadius: "10px 10px 0 0",
            background: "linear-gradient(180deg, #c7ffff 0%, #45cfff 100%)",
            border: "2px solid #0056b8",
            borderBottom: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            padding: "40px 34px 46px",
            background: BG,
            border: "3px double #0056b8",
            boxShadow:
              "0 0 0 2px #b5ffff, 0 18px 34px rgba(0,86,184,0.18), inset 0 0 90px rgba(220,184,255,0.16)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(230px, 58%)",
              height: 12,
              background:
                "linear-gradient(90deg, #1fd4ff 0%, #b5ffff 45%, #dcb8ff 100%)",
              borderRadius: 3,
            }}
          />
          {[
            { top: 24, left: 28 },
            { top: 34, right: 38 },
            { bottom: 134, left: 34 },
            { bottom: 120, right: 46 },
          ].map((sparkle, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                fontFamily: "Impact, sans-serif",
                fontSize: "1.15rem",
                color: index % 2 === 0 ? "#1fd4ff" : "#8a2be2",
                textShadow: "1px 1px 0 #fff",
                ...sparkle,
              }}
            >
              *
            </div>
          ))}
          <p
            style={{
              margin: "8px 0 6px",
              textAlign: "center",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.3em",
              color: "#0056b8",
            }}
          >
            ORACLE MODE // Y2K PROPHECY
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              textAlign: "center",
              fontFamily: "Impact, sans-serif",
              fontSize: "2.7rem",
              color: "#2a1810",
              textShadow: "2px 2px 0 #fff, 4px 4px 0 #1fd4ff",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "0.9rem",
              color: "#8b7355",
              letterSpacing: "0.16em",
            }}
          >
            holographic invitation for seekers of dramatic homepages
          </p>
          <p
            style={{
              margin: "0 0 32px",
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "1.04rem",
              lineHeight: 1.72,
              color: "#3d2f22",
            }}
          >
            The prophecy is clear: there will be glowing buttons, unnecessary
            chrome, and a fresh island of weirdness every time the seal breaks.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StumbleStarSeal />
          </div>
        </div>
      </div>
    </div>
  );
}

function StumbleSailButton() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Impact, sans-serif",
        fontSize: "1.18rem",
        letterSpacing: "0.1em",
        padding: "16px 34px",
        cursor: "pointer",
        color: "#173059",
        background:
          "linear-gradient(135deg, #fff16a 0%, #ffca3a 28%, #ff67c8 72%, #73efff 100%)",
        border: "3px solid #fff5df",
        borderRadius: 999,
        boxShadow:
          "0 0 0 3px #173059, 0 8px 0 #7e2fc5, 0 14px 24px rgba(23,48,89,0.28), inset 0 2px 0 rgba(255,255,255,0.62)",
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      Stumble
    </button>
  );
}

function StumbleDockButton() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Trebuchet MS, Tahoma, sans-serif",
        fontSize: "1rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "14px 28px",
        cursor: "pointer",
        color: "#fffef2",
        background:
          "linear-gradient(180deg, #00dbff 0%, #228dff 28%, #8241ff 78%, #4f189a 100%)",
        border: "3px solid #c8ffff",
        borderRadius: 16,
        boxShadow:
          "0 0 0 2px #173059, 0 8px 18px rgba(23,48,89,0.32), inset 0 2px 0 rgba(255,255,255,0.38)",
        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      }}
    >
      Stumble
    </button>
  );
}

function StumbleBurstButton() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Impact, sans-serif",
        fontSize: "1.08rem",
        letterSpacing: "0.08em",
        padding: "24px 26px",
        cursor: "pointer",
        color: "#173059",
        background:
          "linear-gradient(135deg, #fff16a 0%, #ff9f1a 24%, #ff4fa2 70%, #7a5cff 100%)",
        border: "3px solid #fff5df",
        clipPath:
          "polygon(50% 0%, 63% 17%, 82% 8%, 78% 29%, 100% 36%, 84% 49%, 97% 66%, 74% 68%, 76% 92%, 54% 79%, 40% 100%, 31% 79%, 10% 89%, 14% 66%, 0% 54%, 18% 43%, 7% 23%, 28% 20%, 33% 0%)",
        boxShadow:
          "0 0 0 3px #173059, 0 10px 18px rgba(23,48,89,0.28), inset 0 2px 0 rgba(255,255,255,0.55)",
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      Stumble
    </button>
  );
}

function StumblePortalCore() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Trebuchet MS, Tahoma, sans-serif",
        fontSize: "1rem",
        fontWeight: 800,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        padding: "20px 26px",
        cursor: "pointer",
        color: "#fdf9f0",
        background:
          "radial-gradient(circle at 35% 25%, #ff9be8 0%, #8a2be2 48%, #173059 100%)",
        border: "4px solid #c8ffff",
        borderRadius: "50%",
        minWidth: 148,
        minHeight: 148,
        boxShadow:
          "0 0 0 4px rgba(255,245,223,0.35), 0 0 36px rgba(115,239,255,0.42), inset 0 3px 10px rgba(255,255,255,0.22), inset 0 -8px 16px rgba(0,0,0,0.36)",
        textShadow: "0 1px 2px rgba(0,0,0,0.45)",
        lineHeight: 1.35,
      }}
    >
      Stumble
    </button>
  );
}

function StumbleTicketButton() {
  return (
    <button
      type="button"
      style={{
        fontFamily: "Impact, sans-serif",
        fontSize: "1.08rem",
        letterSpacing: "0.1em",
        padding: "16px 28px",
        cursor: "pointer",
        color: "#173059",
        background:
          "linear-gradient(135deg, #73efff 0%, #d3ffff 20%, #fff16a 58%, #ff67c8 100%)",
        border: "3px solid #173059",
        borderRadius: 12,
        boxShadow:
          "0 6px 0 #173059, 0 12px 22px rgba(23,48,89,0.24), inset 0 2px 0 rgba(255,255,255,0.55)",
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      Stumble
    </button>
  );
}

function Iteration22SailPoster() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(140deg, #09152c 0%, #163d6e 32%, #7d2fd0 68%, #ff6fcf 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 18%, rgba(115,239,255,0.3) 0%, transparent 28%), radial-gradient(circle at 84% 78%, rgba(255,241,106,0.22) 0%, transparent 24%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-6%",
          top: "10%",
          width: "48%",
          height: "78%",
          background: BG,
          border: "4px solid #fff5df",
          boxShadow:
            "0 0 0 4px rgba(23,48,89,0.35), 18px 18px 34px rgba(9,21,44,0.28), inset 0 0 120px rgba(255,159,26,0.12)",
          clipPath: "polygon(0% 8%, 100% 0%, 78% 100%, 0% 90%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 36,
          padding: "7px 12px",
          background: "linear-gradient(180deg, #fff16a 0%, #ff9f1a 100%)",
          border: "2px solid #8b3f00",
          fontFamily: "Impact, sans-serif",
          fontSize: "0.86rem",
          color: "#6b1a00",
          transform: "rotate(-8deg)",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
        }}
      >
        QUEST MODE
      </div>
      <div
        style={{
          position: "absolute",
          top: 34,
          right: 40,
          padding: "7px 12px",
          background: "linear-gradient(180deg, #73efff 0%, #00b8ff 100%)",
          border: "2px solid #173059",
          fontFamily: "Impact, sans-serif",
          fontSize: "0.86rem",
          color: "#fff",
          transform: "rotate(8deg)",
          boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
        }}
      >
        STAR ROUTE
      </div>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          alignItems: "center",
          padding: "56px 44px",
        }}
      >
        <div style={{ position: "relative", minHeight: 560 }}>
          <div
            style={{
              position: "absolute",
              left: "6%",
              top: "10%",
              width: "62%",
              fontFamily: "Palatino, Georgia, serif",
              fontSize: "1.06rem",
              lineHeight: 1.7,
              color: "#3d3428",
            }}
          >
            Chart the glitter sea, dodge the midi storms, and let one loud
            button send you toward a homepage with main-character syndrome.
          </div>
          <div style={{ position: "absolute", left: "10%", bottom: "18%" }}>
            <StumbleSailButton />
          </div>
          <div
            style={{
              position: "absolute",
              left: "14%",
              bottom: "8%",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.18em",
              color: "#7d2fd0",
            }}
          >
            deluxe quest poster / gemwave edition
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            paddingLeft: 30,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.28em",
              color: "#d3ffff",
            }}
          >
            TREASURE CHART DELUXE
          </p>
          <h1
            style={{
              margin: "0 0 18px",
              fontFamily: "Impact, sans-serif",
              fontSize: "clamp(4rem, 10vw, 7rem)",
              lineHeight: 0.92,
              color: "#fff5df",
              textShadow:
                "4px 4px 0 #173059, 8px 8px 0 #ff67c8, 12px 12px 0 rgba(9,21,44,0.28)",
            }}
          >
            Geo
            <br />
            Stumble
          </h1>
          <p
            style={{
              maxWidth: 380,
              margin: 0,
              fontFamily: "Georgia, serif",
              fontSize: "1.08rem",
              lineHeight: 1.65,
              color: "#f5edd6",
            }}
          >
            Less map in a box, more gigantic adventure poster. Built for the
            kind of internet that wanted every landing page to feel like a movie
            trailer.
          </p>
        </div>
      </div>
    </div>
  );
}

function Iteration23RadarDock() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #081326 0%, #173059 38%, #00cfff 100%)",
        padding: "28px",
      }}
    >
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
        }}
      >
        <div
          style={{
            background: BG,
            border: "3px solid #173059",
            boxShadow:
              "0 0 0 3px rgba(211,255,255,0.35), inset 0 0 90px rgba(255,159,26,0.12)",
            padding: "28px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                color: "#173059",
              }}
            >
              RADAR DECK
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: "Impact, sans-serif",
                fontSize: "2.6rem",
                lineHeight: 0.95,
                color: "#173059",
                textShadow: "2px 2px 0 #73efff",
              }}
            >
              Geo
              <br />
              Stumble
            </h1>
          </div>
          <div
            style={{
              display: "grid",
              gap: 10,
              fontFamily: "Trebuchet MS, Tahoma, sans-serif",
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                background: "#fff16a",
                border: "2px solid #8b3f00",
                color: "#6b1a00",
              }}
            >
              Live Route
            </div>
            <div
              style={{
                padding: "10px 12px",
                background: "#73efff",
                border: "2px solid #173059",
                color: "#173059",
              }}
            >
              Deep Surf
            </div>
            <div
              style={{
                padding: "10px 12px",
                background: "#ff67c8",
                border: "2px solid #7e2fc5",
                color: "#fffaf2",
              }}
            >
              Camp Level: Max
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 50%, #0f2850 0%, #081326 62%, #040914 100%)",
            border: "3px solid #d3ffff",
            boxShadow: "0 0 0 3px #ff67c8, 0 18px 36px rgba(4,9,20,0.3)",
          }}
        >
          {[24, 38, 52, 66].map((size, index) => (
            <div
              key={size}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${size}%`,
                height: `${size}%`,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: `2px solid ${index % 2 === 0 ? "#73efff" : "#ff67c8"}`,
                opacity: 0.45,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "2px",
              height: "82%",
              background: "linear-gradient(180deg, transparent, #73efff, transparent)",
              transform: "translate(-50%, -50%)",
              opacity: 0.52,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "82%",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #73efff, transparent)",
              transform: "translate(-50%, -50%)",
              opacity: 0.52,
            }}
          />
          {[
            { top: "22%", left: "58%", color: "#ff67c8" },
            { top: "38%", left: "28%", color: "#fff16a" },
            { top: "64%", left: "64%", color: "#73efff" },
            { top: "70%", left: "40%", color: "#ff9f1a" },
          ].map((point, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: point.color,
                boxShadow: `0 0 18px ${point.color}`,
                ...point,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.76rem",
                letterSpacing: "0.24em",
                color: "#d3ffff",
              }}
            >
              SEEKER CONSOLE
            </p>
            <h2
              style={{
                margin: "0 0 14px",
                fontFamily: "Impact, sans-serif",
                fontSize: "3.6rem",
                color: "#fff5df",
                textShadow: "3px 3px 0 #173059, 6px 6px 0 #ff67c8",
              }}
            >
              GeoStumble
            </h2>
            <p
              style={{
                maxWidth: 360,
                margin: "0 auto 24px",
                fontFamily: "Georgia, serif",
                fontSize: "1rem",
                lineHeight: 1.65,
                color: "#f5edd6",
              }}
            >
              A split-layout command dock instead of a centered card. More ship
              console, less framed parchment.
            </p>
            <StumbleDockButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration24ScrapbookBurst() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f7d9ef 0%, #f5edd6 34%, #b9f7ff 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 18%, rgba(255,103,200,0.22) 0%, transparent 20%), radial-gradient(circle at 88% 24%, rgba(115,239,255,0.24) 0%, transparent 22%), radial-gradient(circle at 70% 76%, rgba(255,241,106,0.22) 0%, transparent 20%)",
        }}
      />
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: "44px 40px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 54,
            left: 52,
            width: 220,
            padding: "18px 18px 24px",
            background: BG,
            border: "3px solid #173059",
            boxShadow: "8px 8px 0 rgba(23,48,89,0.18)",
            transform: "rotate(-9deg)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "0.98rem",
              color: "#7e2fc5",
            }}
          >
            route sketch #004
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: 110,
            right: 84,
            width: 220,
            padding: "18px 18px 24px",
            background: "#173059",
            border: "3px solid #73efff",
            boxShadow: "8px 8px 0 rgba(23,48,89,0.18)",
            transform: "rotate(8deg)",
            color: "#f5edd6",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.16em",
            }}
          >
            GLITTER TIDE WARNING
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 72,
            padding: "8px 14px",
            background: "linear-gradient(180deg, #fff16a 0%, #ff9f1a 100%)",
            border: "2px solid #8b3f00",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.88rem",
            color: "#6b1a00",
            transform: "rotate(-7deg)",
          }}
        >
          MUST CLICK
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 78,
            right: 84,
            padding: "8px 14px",
            background: "linear-gradient(180deg, #73efff 0%, #00b8ff 100%)",
            border: "2px solid #173059",
            fontFamily: "Impact, sans-serif",
            fontSize: "0.88rem",
            color: "#fff",
            transform: "rotate(6deg)",
          }}
        >
          EXTRA EXTRA
        </div>
        <div
          style={{
            minHeight: "calc(100vh - 88px)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "Comic Sans MS, Comic Sans, cursive",
                fontSize: "1rem",
                color: "#7e2fc5",
              }}
            >
              scrapbook chaos edition
            </p>
            <h1
              style={{
                margin: "0 0 18px",
                fontFamily: "Impact, sans-serif",
                fontSize: "clamp(3.8rem, 11vw, 6.2rem)",
                lineHeight: 0.94,
                color: "#173059",
                textShadow: "3px 3px 0 #fff, 6px 6px 0 #ff67c8, 9px 9px 0 #73efff",
              }}
            >
              Geo
              <br />
              Stumble
            </h1>
            <p
              style={{
                maxWidth: 460,
                margin: "0 auto 34px",
                fontFamily: "Georgia, serif",
                fontSize: "1.06rem",
                lineHeight: 1.68,
                color: "#3d3428",
              }}
            >
              A full-page collage with floating scraps, sticker headlines, and
              a starburst CTA. No panel-in-the-middle, just loud layered energy.
            </p>
            <StumbleBurstButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration25PortalOrbit() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 50%, #173059 0%, #0b1730 42%, #04101f 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 24%, rgba(255,103,200,0.22) 0%, transparent 20%), radial-gradient(circle at 82% 28%, rgba(115,239,255,0.2) 0%, transparent 18%), radial-gradient(circle at 50% 80%, rgba(255,241,106,0.16) 0%, transparent 22%)",
        }}
      />
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(76vw, 760px)",
            aspectRatio: "1 / 1",
            display: "grid",
            placeItems: "center",
          }}
        >
          {[100, 76, 52].map((size, index) => (
            <div
              key={size}
              style={{
                position: "absolute",
                width: `${size}%`,
                height: `${size}%`,
                borderRadius: "50%",
                border:
                  index === 0
                    ? "4px solid #73efff"
                    : index === 1
                      ? "4px solid #ff67c8"
                      : "4px solid #fff16a",
                boxShadow:
                  index === 0
                    ? "0 0 30px rgba(115,239,255,0.3)"
                    : index === 1
                      ? "0 0 24px rgba(255,103,200,0.25)"
                      : "0 0 22px rgba(255,241,106,0.22)",
              }}
            />
          ))}
          {[
            { top: "8%", left: "46%", label: "PORTAL" },
            { top: "46%", right: "4%", label: "ISLANDS" },
            { bottom: "10%", left: "42%", label: "MIDI" },
            { top: "46%", left: "5%", label: "GUESTBOOK" },
          ].map((tag, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                padding: "6px 10px",
                background: BG,
                border: "2px solid #173059",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                color: "#173059",
                boxShadow: "4px 4px 0 rgba(23,48,89,0.18)",
                ...tag,
              }}
            >
              {tag.label}
            </div>
          ))}
          <div
            style={{
              position: "relative",
              width: "44%",
              height: "44%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 25%, #f5edd6 0%, #d5f7ff 26%, #ff9be8 54%, #173059 100%)",
              boxShadow:
                "0 0 50px rgba(115,239,255,0.34), inset 0 0 40px rgba(255,255,255,0.24)",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: 20,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontFamily: "Verdana, sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  color: "#173059",
                }}
              >
                ADVENTURE CORE
              </p>
              <h1
                style={{
                  margin: "0 0 16px",
                  fontFamily: "Impact, sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.8rem)",
                  lineHeight: 0.94,
                  color: "#173059",
                  textShadow: "2px 2px 0 #fff, 4px 4px 0 #ff67c8",
                }}
              >
                GeoStumble
              </h1>
              <StumblePortalCore />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration26QuestPass() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 18px",
        background:
          "linear-gradient(135deg, #c7ffff 0%, #f5edd6 36%, #ffb7e7 100%)",
      }}
    >
      <div
        style={{
          width: "min(1080px, 100%)",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "220px 1fr 260px",
          background: BG,
          border: "4px solid #173059",
          boxShadow:
            "0 0 0 4px #73efff, 0 18px 34px rgba(23,48,89,0.22), inset 0 0 100px rgba(255,103,200,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 22,
            background:
              "linear-gradient(90deg, #73efff 0%, #d3ffff 20%, #fff16a 55%, #ff67c8 100%)",
          }}
        />
        <div
          style={{
            padding: "58px 22px 30px",
            borderRight: "3px dashed #173059",
            display: "grid",
            alignContent: "space-between",
            gap: 18,
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.24em",
                color: "#173059",
              }}
            >
              QUEST PASS
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "Impact, sans-serif",
                fontSize: "2.1rem",
                lineHeight: 0.95,
                color: "#173059",
                textShadow: "2px 2px 0 #73efff",
              }}
            >
              Y2K
              <br />
              SURF
            </p>
          </div>
          <div
            style={{
              fontFamily: "Trebuchet MS, Tahoma, sans-serif",
              fontSize: "0.84rem",
              lineHeight: 1.6,
              color: "#3d3428",
            }}
          >
            admit one
            <br />
            star route
            <br />
            glitter class
          </div>
        </div>
        <div
          style={{
            padding: "58px 34px 34px",
            display: "grid",
            alignContent: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              fontSize: "1rem",
              color: "#7e2fc5",
            }}
          >
            one click boarding for the weird web
          </p>
          <h1
            style={{
              margin: "0 0 16px",
              fontFamily: "Impact, sans-serif",
              fontSize: "clamp(3.2rem, 7vw, 5.8rem)",
              lineHeight: 0.92,
              color: "#173059",
              textShadow: "3px 3px 0 #fff, 6px 6px 0 #ff67c8, 9px 9px 0 #73efff",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
            margin: 0,
            maxWidth: 500,
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "#3d3428",
            }}
          >
            A wide horizontal pass instead of a framed homepage: part ticket,
            part boarding stub, part arcade flyer. The structure is the whole
            gimmick.
          </p>
        </div>
        <div
          style={{
            padding: "58px 24px 34px",
            borderLeft: "3px dashed #173059",
            display: "grid",
            placeItems: "center",
            gap: 16,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              background: "linear-gradient(180deg, #fff16a 0%, #ff9f1a 100%)",
              border: "2px solid #8b3f00",
              fontFamily: "Impact, sans-serif",
              fontSize: "0.82rem",
              color: "#6b1a00",
              transform: "rotate(6deg)",
            }}
          >
            PRIORITY SURF
          </div>
          <StumbleTicketButton />
          <p
            style={{
              margin: 0,
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.76rem",
              letterSpacing: "0.18em",
              color: "#173059",
            }}
          >
            gate 1999 / row glam
          </p>
        </div>
      </div>
    </div>
  );
}

type Iteration23NextTheme = {
  pageBg: string;
  bezelOuter: string;
  bezelInner: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  screenBg: string;
  screenBorder: string;
  screenGlow: string;
  sidebarBg: string;
  sidebarBorder: string;
  statusBg: string;
  statusText: string;
  marqueeText: string;
  ledOnline: string;
  ledIdle: string;
  guestbookName: string;
  helperText: string;
  footerText: string;
  buttonBg: string;
  buttonBorder: string;
  buttonText: string;
};

function Iteration23Next({
  label,
  theme,
  statusCopy,
  marqueeCopy,
  stumbleCopy,
  makingOfCopy,
}: {
  label: string;
  theme: Iteration23NextTheme;
  statusCopy: string;
  marqueeCopy: string;
  stumbleCopy: string;
  makingOfCopy: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          background: theme.bezelOuter,
          border: `3px solid ${theme.bezelInner}`,
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 28px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1024,
            margin: "0 auto",
            minHeight: 768,
            background: "#060b14",
            border: "2px solid #02050b",
            borderRadius: 10,
            overflow: "hidden",
            display: "grid",
            gridTemplateRows: "52px 1fr 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: theme.toolbarBg,
              borderBottom: `2px solid ${theme.toolbarBorder}`,
              color: theme.toolbarText,
              fontFamily: "Tahoma, Verdana, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              padding: "0 12px",
              textTransform: "uppercase",
            }}
          >
            <button
              type="button"
              style={{
                background: theme.buttonBg,
                border: `2px solid ${theme.buttonBorder}`,
                color: theme.buttonText,
                font: "700 0.72rem Tahoma, Verdana, sans-serif",
                letterSpacing: "0.1em",
                padding: "7px 12px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Stumble Again
            </button>
            <span>Saved: 00</span>
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: theme.ledOnline,
                  boxShadow: `0 0 8px ${theme.ledOnline}`,
                }}
              />
              3 in room
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "7fr 3fr",
              gap: 14,
              padding: 14,
              background: "#040913",
            }}
          >
            <div
              style={{
                border: `2px solid ${theme.screenBorder}`,
                boxShadow: `0 0 0 2px #02050b, 0 0 28px ${theme.screenGlow}`,
                background: theme.screenBg,
                position: "relative",
                overflow: "hidden",
                display: "grid",
                gridTemplateRows: "44px 1fr",
              }}
            >
              <div
                style={{
                  background: theme.statusBg,
                  color: theme.statusText,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 12px",
                  font: "700 0.72rem Courier New, monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: theme.ledIdle,
                    boxShadow: `0 0 8px ${theme.ledIdle}`,
                    animation: "geostumble-blink 0.9s steps(2, start) infinite",
                  }}
                />
                {statusCopy}
              </div>
              <div style={{ position: "relative", padding: 12 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 12,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 46%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    border: "2px dashed rgba(255,255,255,0.4)",
                    display: "grid",
                    placeItems: "center",
                    color: "#d3ffff",
                    fontFamily: "Verdana, sans-serif",
                    textAlign: "center",
                    padding: 18,
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: "0.8rem", letterSpacing: "0.14em" }}>
                      PERSONA IFRAME / 1024x768
                    </p>
                    <h1 style={{ margin: "0 0 10px", fontFamily: "Impact, sans-serif", fontSize: "3rem" }}>
                      GeoStumble
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.98rem", lineHeight: 1.6 }}>{stumbleCopy}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                border: `2px solid ${theme.sidebarBorder}`,
                background: theme.sidebarBg,
                color: "#f5edd6",
                display: "grid",
                gridTemplateRows: "1fr 170px",
                minHeight: 0,
              }}
            >
              <div style={{ borderBottom: "2px solid rgba(0,0,0,0.45)", padding: 12 }}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: "0.74rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: theme.guestbookName,
                  }}
                >
                  Guestbook Live
                </p>
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.34)",
                    background: "rgba(0,0,0,0.42)",
                    padding: 10,
                    font: "0.78rem/1.45 Courier New, monospace",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#ff9f1a" }}>tyler</strong>: this page has 4 spinning skull gifs
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#73efff" }}>dave</strong>: guestbook still loads on dial-up, wow
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong style={{ color: "#ff67c8" }}>neo</strong>: {label}
                  </p>
                </div>
                <p style={{ margin: "10px 0 0", font: "0.7rem Tahoma, Verdana, sans-serif", color: theme.helperText }}>
                  140 chars max - sync debounce 3s
                </p>
              </div>

              <div style={{ padding: 12 }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "Verdana, sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#fff16a",
                  }}
                >
                  Making Of
                </p>
                <div
                  style={{
                    border: "2px solid rgba(255,255,255,0.28)",
                    background: "linear-gradient(180deg, #1f2638 0%, #0e1320 100%)",
                    padding: 10,
                    fontFamily: "Tahoma, Verdana, sans-serif",
                    fontSize: "0.76rem",
                    lineHeight: 1.45,
                  }}
                >
                  <p style={{ margin: "0 0 6px", color: "#d3ffff" }}>RealPlayer (muted)</p>
                  <p style={{ margin: 0, color: "#b4bed1" }}>{makingOfCopy}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.18)",
              color: theme.footerText,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 12px",
              font: "0.68rem Tahoma, Verdana, sans-serif",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>powered by cloudflare • workers • jazz • mux</span>
            <div
              style={{
                marginLeft: "auto",
                width: 200,
                overflow: "hidden",
                whiteSpace: "nowrap",
                position: "relative",
                opacity: 0.9,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: "geostumble-marquee 9s linear infinite",
                }}
              >
                {marqueeCopy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration27RadarDockStudio() {
  return (
    <Iteration23Next
      label="crt studio pass"
      statusCopy="Dave is idle."
      stumbleCopy="Variant A keeps the radar-dock energy but moves to a strict monitor shell and TV-station toolbar."
      makingOfCopy="rewinding tape... persona cut loading"
      marqueeCopy="optimized for netscape // aol keyword: geostumble // no flash required //"
      theme={{
        pageBg: "radial-gradient(circle at 50% 20%, #1a243b 0%, #070b14 65%)",
        bezelOuter: "linear-gradient(180deg, #212a3f 0%, #0b101d 100%)",
        bezelInner: "#4e5d79",
        toolbarBg: "linear-gradient(180deg, #d8dde8 0%, #9fa8bc 100%)",
        toolbarBorder: "#4f5d79",
        toolbarText: "#0c1730",
        screenBg: "radial-gradient(circle at 50% 30%, #112f58 0%, #050d1d 90%)",
        screenBorder: "#73efff",
        screenGlow: "rgba(115,239,255,0.38)",
        sidebarBg: "linear-gradient(180deg, #23314d 0%, #11192d 100%)",
        sidebarBorder: "#6f80a8",
        statusBg: "linear-gradient(90deg, #173059 0%, #0d1e3f 100%)",
        statusText: "#d3ffff",
        marqueeText: "#d6deef",
        ledOnline: "#7fff9f",
        ledIdle: "#ff67c8",
        guestbookName: "#73efff",
        helperText: "#98a8ca",
        footerText: "#a8b4d1",
        buttonBg: "linear-gradient(180deg, #fff16a 0%, #ff9f1a 100%)",
        buttonBorder: "#8b3f00",
        buttonText: "#3a1600",
      }}
    />
  );
}

function Iteration28RadarDockBroadcast() {
  return (
    <Iteration23Next
      label="broadcast control room"
      statusCopy="UNDER CONSTRUCTION - Tyler editing homepage now."
      stumbleCopy="Variant B leans harder into the on-stage collaboration beat with a louder status banner and brighter social rail."
      makingOfCopy="encoding... mux track still processing"
      marqueeCopy="sponsored by dial-up dreams // best viewed at 1024x768 // geocities forever //"
      theme={{
        pageBg: "radial-gradient(circle at 50% 18%, #2a1e3d 0%, #0a0a12 64%)",
        bezelOuter: "linear-gradient(180deg, #2f2548 0%, #0f0b1a 100%)",
        bezelInner: "#7b63a6",
        toolbarBg: "linear-gradient(180deg, #efe8ff 0%, #baa9e5 100%)",
        toolbarBorder: "#5e4a89",
        toolbarText: "#231537",
        screenBg: "radial-gradient(circle at 52% 32%, #2c1e4f 0%, #0f0a1f 92%)",
        screenBorder: "#ff67c8",
        screenGlow: "rgba(255,103,200,0.4)",
        sidebarBg: "linear-gradient(180deg, #3f1f58 0%, #1f102d 100%)",
        sidebarBorder: "#b18be3",
        statusBg: "linear-gradient(90deg, #ff67c8 0%, #7e2fc5 100%)",
        statusText: "#fff9d6",
        marqueeText: "#f1e6ff",
        ledOnline: "#73efff",
        ledIdle: "#fff16a",
        guestbookName: "#fff16a",
        helperText: "#dcccf6",
        footerText: "#dcccf6",
        buttonBg: "linear-gradient(180deg, #73efff 0%, #2f7be5 100%)",
        buttonBorder: "#173059",
        buttonText: "#f2fbff",
      }}
    />
  );
}

function Iteration29RadarDockArcade() {
  return (
    <Iteration23Next
      label="arcade hallway mode"
      statusCopy="Dave is idle."
      stumbleCopy="Variant C pushes arcade contrast: neon cyan with amber controls while preserving the same 70/30 information hierarchy."
      makingOfCopy="rewinding tape... press play to start"
      marqueeCopy="aol keyword: y2k chaos // guestbook online // modem lights are healthy //"
      theme={{
        pageBg: "radial-gradient(circle at 50% 22%, #0f3140 0%, #03070f 66%)",
        bezelOuter: "linear-gradient(180deg, #1d3f4d 0%, #09151f 100%)",
        bezelInner: "#4f899b",
        toolbarBg: "linear-gradient(180deg, #d3f7ff 0%, #8bc6d5 100%)",
        toolbarBorder: "#2f5967",
        toolbarText: "#10222b",
        screenBg: "radial-gradient(circle at 50% 35%, #0c566d 0%, #062332 88%)",
        screenBorder: "#73efff",
        screenGlow: "rgba(115,239,255,0.42)",
        sidebarBg: "linear-gradient(180deg, #0b2e3b 0%, #06161f 100%)",
        sidebarBorder: "#2f6677",
        statusBg: "linear-gradient(90deg, #fff16a 0%, #ff9f1a 100%)",
        statusText: "#311700",
        marqueeText: "#bcefff",
        ledOnline: "#7fff9f",
        ledIdle: "#ff9f1a",
        guestbookName: "#73efff",
        helperText: "#88b7c8",
        footerText: "#96cad8",
        buttonBg: "linear-gradient(180deg, #ff9f1a 0%, #d45700 100%)",
        buttonBorder: "#6b1a00",
        buttonText: "#fff7e5",
      }}
    />
  );
}

function Iteration30RadarDockNewswire() {
  return (
    <Iteration23Next
      label="newswire utility pass"
      statusCopy="Network stable - 5 viewers in room."
      stumbleCopy="Variant D is calmer and newsroom-like: silver chrome, readable rails, and less neon while keeping the CRT monitor fiction."
      makingOfCopy="playback ready - click play in RealPlayer"
      marqueeCopy="optimized for judge laptops // fail loud if registry missing // one room, one feed //"
      theme={{
        pageBg: "radial-gradient(circle at 50% 16%, #2f3749 0%, #11141f 65%)",
        bezelOuter: "linear-gradient(180deg, #3a4459 0%, #1a2232 100%)",
        bezelInner: "#717f9b",
        toolbarBg: "linear-gradient(180deg, #f2f5fa 0%, #bcc6d8 100%)",
        toolbarBorder: "#5f6d88",
        toolbarText: "#1c2536",
        screenBg: "radial-gradient(circle at 48% 34%, #264465 0%, #101a2d 90%)",
        screenBorder: "#9ec4ff",
        screenGlow: "rgba(158,196,255,0.34)",
        sidebarBg: "linear-gradient(180deg, #2d3a52 0%, #1a2232 100%)",
        sidebarBorder: "#7084ac",
        statusBg: "linear-gradient(90deg, #d8e4ff 0%, #9bb0d8 100%)",
        statusText: "#182238",
        marqueeText: "#d2dcf0",
        ledOnline: "#73efff",
        ledIdle: "#9ec4ff",
        guestbookName: "#d8e4ff",
        helperText: "#b0bcd7",
        footerText: "#b7c4df",
        buttonBg: "linear-gradient(180deg, #fff 0%, #d9dfeb 100%)",
        buttonBorder: "#5f6d88",
        buttonText: "#1f2a40",
      }}
    />
  );
}

function Iteration31RadarDockAfterDark() {
  return (
    <Iteration23Next
      label="after dark social room"
      statusCopy="UNDER CONSTRUCTION - neon mode enabled."
      stumbleCopy="Variant E is the most theatrical: deep black bezel, bold blinking construction copy, and sponsor-marquee emphasis."
      makingOfCopy="rewinding tape... loading behind-the-scenes clip"
      marqueeCopy="powered by workers + jazz + mux // retro social internet in one room //"
      theme={{
        pageBg: "radial-gradient(circle at 50% 12%, #1f1630 0%, #05050a 62%)",
        bezelOuter: "linear-gradient(180deg, #191223 0%, #08070d 100%)",
        bezelInner: "#57406f",
        toolbarBg: "linear-gradient(180deg, #ddd3f4 0%, #9f8bbb 100%)",
        toolbarBorder: "#4d3d66",
        toolbarText: "#1b1330",
        screenBg: "radial-gradient(circle at 50% 30%, #2c1f51 0%, #090815 90%)",
        screenBorder: "#c89eff",
        screenGlow: "rgba(200,158,255,0.46)",
        sidebarBg: "linear-gradient(180deg, #2d1d45 0%, #140d22 100%)",
        sidebarBorder: "#8f74b3",
        statusBg: "linear-gradient(90deg, #fff16a 0%, #ff67c8 50%, #7e2fc5 100%)",
        statusText: "#1f0f2f",
        marqueeText: "#eadcfb",
        ledOnline: "#73efff",
        ledIdle: "#fff16a",
        guestbookName: "#ff9f1a",
        helperText: "#cdb8e8",
        footerText: "#cbb7e8",
        buttonBg: "linear-gradient(180deg, #ff67c8 0%, #7e2fc5 100%)",
        buttonBorder: "#3f165d",
        buttonText: "#fff8dc",
      }}
    />
  );
}

function LandingStumbleButton({
  accent,
  text,
}: {
  accent: string;
  text: string;
}) {
  return (
    <button
      type="button"
      style={{
        border: "2px solid #120f08",
        background: `linear-gradient(180deg, ${accent} 0%, #ff9f1a 100%)`,
        color: "#231200",
        fontFamily: "Tahoma, Verdana, sans-serif",
        fontSize: "1.05rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "14px 24px",
        boxShadow: "0 4px 0 rgba(0,0,0,0.45)",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}

function Iteration32LandingStation() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 20%, #1f2a3b 0%, #060910 65%)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(1024px, 100%)",
          minHeight: 768,
          border: "4px solid #3e506f",
          borderRadius: 16,
          background: "linear-gradient(180deg, #0f1729 0%, #060a13 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          padding: 22,
        }}
      >
        <div
          style={{
            height: "100%",
            border: "2px solid #627395",
            background: "#0a1120",
            display: "grid",
            gridTemplateRows: "38px 1fr 30px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              borderBottom: "2px solid #526183",
              color: "#d5e5ff",
              font: "700 0.72rem Tahoma, Verdana, sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "inline-block", paddingLeft: 12, animation: "geostumble-marquee 11s linear infinite" }}>
              sponsored by geo-yahoo • aol keyword geostumble • optimized for netscape •
            </span>
          </div>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              padding: 24,
              background:
                "radial-gradient(circle at 50% 36%, rgba(115,239,255,0.2) 0%, transparent 46%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
            }}
          >
            <div style={{ textAlign: "center", color: "#f5edd6", maxWidth: 620 }}>
              <p style={{ margin: "0 0 10px", font: "0.76rem Verdana, sans-serif", letterSpacing: "0.2em" }}>
                CHANNEL 404 - NIGHT FEED
              </p>
              <h1 style={{ margin: "0 0 10px", fontFamily: "Impact, sans-serif", fontSize: "5rem", lineHeight: 0.9 }}>
                GeoStumble
              </h1>
              <p style={{ margin: "0 0 24px", font: "1rem/1.6 Georgia, serif", color: "#d3ffff" }}>
                Step into random Y2K homepages and feel the dial-up era hit instantly.
              </p>
              <LandingStumbleButton accent="#fff16a" text="Stumble" />
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid #4d5f81",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9bb0d8",
              font: "0.68rem Tahoma, Verdana, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            press stumble to enter the room
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration33LandingNewswire() {
  return (
    <div style={{ minHeight: "100vh", background: "#d8dfec", padding: 28, display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: "min(1024px, 100%)",
          minHeight: 768,
          border: "3px solid #5f6d88",
          background: "#f2f5fa",
          boxShadow: "0 14px 28px rgba(18,31,52,0.35)",
          display: "grid",
          gridTemplateRows: "40px 1fr",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #fff 0%, #d9dfeb 100%)",
            borderBottom: "2px solid #7a88a4",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            color: "#1f2a40",
            font: "700 0.72rem Tahoma, Verdana, sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          GeoStumble Station - landing desk
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", minHeight: 0 }}>
          <div style={{ padding: 26, borderRight: "1px solid #aab6ce" }}>
            <p style={{ margin: "0 0 6px", font: "0.74rem Verdana, sans-serif", letterSpacing: "0.18em", color: "#4d5f81" }}>
              LIVE BULLETIN
            </p>
            <h1 style={{ margin: "0 0 12px", fontFamily: "Impact, sans-serif", fontSize: "4.5rem", lineHeight: 0.95, color: "#23314d" }}>
              GeoStumble
            </h1>
            <p style={{ margin: "0 0 20px", maxWidth: 560, font: "1rem/1.6 Georgia, serif", color: "#2f3f5f" }}>
              The internet is having a moment. Click once to jump into a random archived personality page.
            </p>
            <LandingStumbleButton accent="#d8e4ff" text="Stumble" />
          </div>
          <div style={{ padding: 16, background: "#e7ecf6" }}>
            <p style={{ margin: "0 0 10px", font: "700 0.72rem Tahoma, Verdana, sans-serif", letterSpacing: "0.14em", textTransform: "uppercase", color: "#253552" }}>
              Credits Marquee
            </p>
            <div style={{ border: "1px solid #8fa0c0", padding: 8, background: "#f8fbff", font: "0.74rem/1.5 Courier New, monospace", color: "#2f3f5f" }}>
              powered by workers + jazz + mux
              <br />
              best viewed at 1024x768
              <br />
              guestbook + presence during demo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration34LandingArcade() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #081a1e 0%, #05060d 70%)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(980px, 100%)", minHeight: 720, border: "3px solid #2f6677", background: "#071822", boxShadow: "0 18px 42px rgba(0,0,0,0.5)", padding: 18 }}>
        <div style={{ height: "100%", border: "2px solid #73efff", background: "radial-gradient(circle at 50% 30%, #0f566a 0%, #081a25 88%)", padding: 30, color: "#d9fcff", textAlign: "center" }}>
          <p style={{ margin: "0 0 12px", font: "0.74rem Verdana, sans-serif", letterSpacing: "0.22em" }}>ARCADE MODEM LOBBY</p>
          <h1 style={{ margin: "0 0 12px", fontFamily: "Impact, sans-serif", fontSize: "5.2rem", lineHeight: 0.9, textShadow: "3px 3px 0 #173059" }}>GeoStumble</h1>
          <p style={{ margin: "0 auto 26px", maxWidth: 600, font: "1rem/1.6 Georgia, serif", color: "#bcefff" }}>
            Loud colors, blinking scanlines, and one giant button to launch your next forgotten homepage.
          </p>
          <LandingStumbleButton accent="#73efff" text="Stumble" />
        </div>
      </div>
    </div>
  );
}

function Iteration35LandingUnderConstruction() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 15%, #3b2a4f 0%, #0a0812 66%)", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "min(1024px, 100%)", minHeight: 768, border: "4px solid #8f74b3", background: "#1a1129", boxShadow: "0 24px 50px rgba(0,0,0,0.6)", padding: 16 }}>
        <div style={{ height: "100%", border: "2px dashed #ff67c8", display: "grid", gridTemplateRows: "42px 1fr 50px", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg, #fff16a 0%, #ff67c8 50%, #7e2fc5 100%)", color: "#1f0f2f", display: "flex", alignItems: "center", padding: "0 12px", font: "700 0.74rem Tahoma, Verdana, sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            UNDER CONSTRUCTION // station warm-up mode
          </div>
          <div style={{ display: "grid", placeItems: "center", padding: 24 }}>
            <div style={{ textAlign: "center", color: "#f5edd6", maxWidth: 620 }}>
              <h1 style={{ margin: "0 0 10px", fontFamily: "Impact, sans-serif", fontSize: "5rem", lineHeight: 0.9 }}>GeoStumble</h1>
              <p style={{ margin: "0 0 24px", font: "1rem/1.6 Georgia, serif", color: "#eadcfb" }}>
                Hit Stumble and jump into the live room: guestbook chatter, presence count, and making-of clip.
              </p>
              <LandingStumbleButton accent="#ff67c8" text="Stumble" />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #6a5488", overflow: "hidden", whiteSpace: "nowrap", color: "#cdb8e8", font: "0.7rem Tahoma, Verdana, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
            <span style={{ display: "inline-block", paddingLeft: 12, animation: "geostumble-marquee 10s linear infinite" }}>
              no broken embeds • fallback copy for failures • judges see state in one glance •
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Iteration36LandingBillboard() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #201629 0%, #0a0a11 62%)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(1024px, 100%)", minHeight: 768, border: "3px solid #57406f", background: "#120e1b", boxShadow: "0 20px 46px rgba(0,0,0,0.55)", padding: 22 }}>
        <div style={{ height: "100%", border: "2px solid #c89eff", background: "radial-gradient(circle at 50% 34%, #2c1f51 0%, #110d1b 88%)", display: "grid", placeItems: "center", padding: 32 }}>
          <div style={{ textAlign: "center", color: "#f5edd6", maxWidth: 620 }}>
            <p style={{ margin: "0 0 8px", font: "0.74rem Verdana, sans-serif", letterSpacing: "0.2em", color: "#eadcfb" }}>THE Y2K STUMBLE NETWORK</p>
            <h1 style={{ margin: "0 0 12px", fontFamily: "Impact, sans-serif", fontSize: "5.4rem", lineHeight: 0.88, textShadow: "4px 4px 0 #7e2fc5" }}>GeoStumble</h1>
            <p style={{ margin: "0 0 24px", font: "1rem/1.62 Georgia, serif", color: "#d8c9f1" }}>
              One click to time-travel. No onboarding. Just instant era shock and social proof.
            </p>
            <LandingStumbleButton accent="#fff16a" text="Stumble" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NeonStumbleCta({
  accent,
  label = "Stumble",
}: {
  accent: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      style={{
        position: "relative",
        border: `2px solid ${accent}`,
        background: "linear-gradient(180deg, #1a0f2e 0%, #0a0614 100%)",
        color: accent,
        fontFamily: "Impact, sans-serif",
        fontSize: "1.35rem",
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        padding: "16px 40px",
        cursor: "pointer",
        textShadow: `0 0 8px ${accent}, 0 0 18px ${accent}`,
        boxShadow: `0 0 0 2px rgba(0,0,0,0.6), 0 0 28px ${accent}, inset 0 0 18px rgba(255,255,255,0.05)`,
      }}
    >
      {label}
    </button>
  );
}

function Iteration37LandingNeonOrbit() {
  const rings = [96, 72, 52, 34];
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 40%, #2d1d45 0%, #120a22 45%, #030309 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 22%, rgba(255,103,200,0.28) 0%, transparent 22%), radial-gradient(circle at 84% 24%, rgba(115,239,255,0.22) 0%, transparent 20%), radial-gradient(circle at 50% 86%, rgba(255,241,106,0.18) 0%, transparent 24%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(82vmin, 820px)",
            aspectRatio: "1 / 1",
            display: "grid",
            placeItems: "center",
          }}
        >
          {rings.map((size, index) => {
            const color =
              index === 0
                ? "#ff67c8"
                : index === 1
                  ? "#c89eff"
                  : index === 2
                    ? "#73efff"
                    : "#fff16a";
            return (
              <div
                key={size}
                style={{
                  position: "absolute",
                  width: `${size}%`,
                  height: `${size}%`,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 24px ${color}`,
                  opacity: 0.75,
                }}
              />
            );
          })}
          {[
            { top: "6%", left: "48%", label: "GUESTBOOK", color: "#ff67c8" },
            { top: "44%", right: "-6%", label: "PRESENCE", color: "#73efff" },
            { bottom: "6%", left: "44%", label: "MAKING OF", color: "#fff16a" },
            { top: "44%", left: "-6%", label: "RANDOM", color: "#c89eff" },
          ].map((tag) => (
            <div
              key={tag.label}
              style={{
                position: "absolute",
                padding: "6px 12px",
                background: "rgba(10,6,20,0.82)",
                border: `2px solid ${tag.color}`,
                color: tag.color,
                fontFamily: "Tahoma, Verdana, sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                boxShadow: `0 0 18px ${tag.color}`,
                top: tag.top,
                left: (tag as { left?: string }).left,
                right: (tag as { right?: string }).right,
                bottom: (tag as { bottom?: string }).bottom,
              }}
            >
              {tag.label}
            </div>
          ))}
          <div
            style={{
              width: "42%",
              height: "42%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 36% 28%, #fff16a 0%, #ff67c8 30%, #7e2fc5 65%, #090412 100%)",
              boxShadow:
                "0 0 60px rgba(255,103,200,0.55), inset 0 0 40px rgba(255,255,255,0.22)",
              display: "grid",
              placeItems: "center",
              padding: 22,
              textAlign: "center",
              color: "#fff8dc",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontFamily: "Verdana, sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.28em",
                  color: "#fff8dc",
                }}
              >
                PORTAL CORE
              </p>
              <h1
                style={{
                  margin: "0 0 14px",
                  fontFamily: "Impact, sans-serif",
                  fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
                  lineHeight: 0.92,
                  color: "#fff8dc",
                  textShadow:
                    "3px 3px 0 #7e2fc5, 6px 6px 0 rgba(0,0,0,0.45), 0 0 18px #ff67c8",
                }}
              >
                Geo
                <br />
                Stumble
              </h1>
              <NeonStumbleCta accent="#fff16a" />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 18,
          display: "flex",
          justifyContent: "center",
          color: "#cdb8e8",
          font: "0.7rem Tahoma, Verdana, sans-serif",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        neon orbit // powered by workers + jazz + mux
      </div>
    </div>
  );
}

function Iteration38LandingMidnightCollage() {
  const scraps = [
    {
      top: "6%",
      left: "5%",
      rotate: -8,
      bg: "#1a0f2e",
      border: "#ff67c8",
      color: "#ff67c8",
      label: "ROUTE SKETCH #404",
      font: "Comic Sans MS, cursive",
      size: "0.9rem",
    },
    {
      top: "10%",
      right: "6%",
      rotate: 7,
      bg: "#7e2fc5",
      border: "#fff16a",
      color: "#fff8dc",
      label: "GLITTER TIDE WARNING",
      font: "Verdana, sans-serif",
      size: "0.78rem",
    },
    {
      bottom: "14%",
      left: "6%",
      rotate: -6,
      bg: "linear-gradient(180deg, #fff16a 0%, #ff9f1a 100%)",
      border: "#3a1600",
      color: "#3a1600",
      label: "MUST CLICK",
      font: "Impact, sans-serif",
      size: "1.1rem",
    },
    {
      bottom: "10%",
      right: "8%",
      rotate: 6,
      bg: "linear-gradient(180deg, #73efff 0%, #2f7be5 100%)",
      border: "#173059",
      color: "#f4feff",
      label: "EXTRA EXTRA",
      font: "Impact, sans-serif",
      size: "1.1rem",
    },
    {
      top: "44%",
      left: "1%",
      rotate: 3,
      bg: "#0a0614",
      border: "#c89eff",
      color: "#c89eff",
      label: "AOL KEYWORD: GEOSTUMBLE",
      font: "Courier New, monospace",
      size: "0.72rem",
    },
    {
      top: "38%",
      right: "2%",
      rotate: -4,
      bg: "#0a0614",
      border: "#73efff",
      color: "#73efff",
      label: "OPTIMIZED FOR NETSCAPE",
      font: "Courier New, monospace",
      size: "0.72rem",
    },
  ];
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 18%, #2d1d45 0%, #100820 50%, #030309 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 20%, rgba(255,103,200,0.22) 0%, transparent 24%), radial-gradient(circle at 88% 24%, rgba(115,239,255,0.2) 0%, transparent 24%), radial-gradient(circle at 70% 82%, rgba(255,241,106,0.18) 0%, transparent 24%)",
          pointerEvents: "none",
        }}
      />
      {scraps.map((scrap, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: (scrap as { top?: string }).top,
            left: (scrap as { left?: string }).left,
            right: (scrap as { right?: string }).right,
            bottom: (scrap as { bottom?: string }).bottom,
            padding: "10px 14px",
            background: scrap.bg,
            border: `2px solid ${scrap.border}`,
            color: scrap.color,
            fontFamily: scrap.font,
            fontSize: scrap.size,
            letterSpacing: "0.08em",
            boxShadow: `8px 8px 0 rgba(0,0,0,0.55)`,
            transform: `rotate(${scrap.rotate}deg)`,
            maxWidth: 240,
          }}
        >
          {scrap.label}
        </div>
      ))}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "60px 40px",
        }}
      >
        <div style={{ textAlign: "center", color: "#fff8dc", maxWidth: 640 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "Comic Sans MS, cursive",
              fontSize: "1.1rem",
              color: "#fff16a",
              textShadow: "0 0 12px rgba(255,241,106,0.6)",
            }}
          >
            midnight scrapbook edition
          </p>
          <h1
            style={{
              margin: "0 0 24px",
              fontFamily: "Impact, sans-serif",
              fontSize: "clamp(4rem, 12vw, 6.6rem)",
              lineHeight: 0.9,
              color: "#fff8dc",
              textShadow:
                "4px 4px 0 #7e2fc5, 8px 8px 0 #ff67c8, 12px 12px 0 #73efff, 0 0 24px rgba(255,103,200,0.7)",
            }}
          >
            Geo
            <br />
            Stumble
          </h1>
          <p
            style={{
              margin: "0 auto 32px",
              maxWidth: 520,
              fontFamily: "Georgia, serif",
              fontSize: "1.1rem",
              lineHeight: 1.65,
              color: "#eadcfb",
            }}
          >
            A full-bleed neon collage: sticker headlines, tilted scraps, and a
            burst of sponsor banners. Then: one neon stumble button.
          </p>
          <NeonStumbleCta accent="#ff67c8" />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "10px 0",
          background: "linear-gradient(90deg, #fff16a 0%, #ff67c8 50%, #7e2fc5 100%)",
          color: "#1f0f2f",
          fontFamily: "Tahoma, Verdana, sans-serif",
          fontSize: "0.74rem",
          letterSpacing: "0.16em",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            display: "inline-block",
            animation: "geostumble-marquee 12s linear infinite",
          }}
        >
          sponsored by dial-up dreams // aol keyword geostumble // best viewed at
          1024x768 // guestbook live // making-of clip warm // no flash required //
        </span>
      </div>
    </div>
  );
}

function Iteration39LandingDialupConstellation() {
  const nodes = [
    { top: "18%", left: "12%", label: "MODEM", color: "#73efff" },
    { top: "28%", left: "44%", label: "WORKER", color: "#fff16a" },
    { top: "22%", left: "78%", label: "MUX", color: "#ff9f1a" },
    { top: "58%", left: "24%", label: "JAZZ ROOM", color: "#ff67c8" },
    { top: "64%", left: "66%", label: "GUESTBOOK", color: "#c89eff" },
    { top: "82%", left: "48%", label: "YOU", color: "#f5edd6" },
  ];
  const lines = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
  ];
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 30%, #0f1a36 0%, #060814 50%, #020308 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(115,239,255,0.12) 1px, transparent 1px), radial-gradient(rgba(255,103,200,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px, 120px 120px",
          backgroundPosition: "0 0, 30px 30px",
          pointerEvents: "none",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {lines.map((l, i) => {
          const a = nodes[l.from];
          const b = nodes[l.to];
          return (
            <line
              key={i}
              x1={parseFloat(a.left)}
              y1={parseFloat(a.top)}
              x2={parseFloat(b.left)}
              y2={parseFloat(b.top)}
              stroke="#73efff"
              strokeWidth="0.18"
              strokeDasharray="0.6 0.6"
              opacity="0.7"
            />
          );
        })}
      </svg>
      {nodes.map((node) => (
        <div
          key={node.label}
          style={{
            position: "absolute",
            top: node.top,
            left: node.left,
            transform: "translate(-50%, -50%)",
            padding: "6px 12px",
            background: "rgba(6,8,20,0.85)",
            border: `2px solid ${node.color}`,
            color: node.color,
            fontFamily: "Tahoma, Verdana, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            boxShadow: `0 0 18px ${node.color}`,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: node.color,
              boxShadow: `0 0 10px ${node.color}`,
              marginRight: 8,
              animation: "geostumble-blink 1.2s steps(2, start) infinite",
            }}
          />
          {node.label}
        </div>
      ))}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#f5edd6",
            maxWidth: 620,
            padding: "30px 32px",
            background:
              "linear-gradient(180deg, rgba(26,17,41,0.85) 0%, rgba(10,6,20,0.85) 100%)",
            border: "2px solid #c89eff",
            boxShadow:
              "0 0 0 2px rgba(0,0,0,0.55), 0 0 30px rgba(200,158,255,0.45)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "Verdana, sans-serif",
              fontSize: "0.74rem",
              letterSpacing: "0.28em",
              color: "#73efff",
            }}
          >
            DIAL-UP CONSTELLATION
          </p>
          <h1
            style={{
              margin: "0 0 14px",
              fontFamily: "Impact, sans-serif",
              fontSize: "clamp(3rem, 9vw, 5.2rem)",
              lineHeight: 0.92,
              color: "#f5edd6",
              textShadow: "3px 3px 0 #7e2fc5, 0 0 22px rgba(255,103,200,0.55)",
            }}
          >
            GeoStumble
          </h1>
          <p
            style={{
              margin: "0 auto 26px",
              maxWidth: 520,
              fontFamily: "Georgia, serif",
              fontSize: "1.05rem",
              lineHeight: 1.65,
              color: "#d8c9f1",
            }}
          >
            Six blinking nodes across a starfield. Each one is a service in the
            stack - press stumble to jump through them into a live persona page.
          </p>
          <NeonStumbleCta accent="#73efff" />
        </div>
      </div>
    </div>
  );
}

function Iteration40LandingVhsCover() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 30%, #321245 0%, #130821 55%, #04020a 100%)",
        display: "grid",
        placeItems: "center",
        padding: 32,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 5px)",
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "min(760px, 100%)",
          aspectRatio: "3 / 4",
          border: "4px solid #fff16a",
          background:
            "linear-gradient(160deg, #ff67c8 0%, #7e2fc5 42%, #173059 100%)",
          boxShadow:
            "0 0 0 4px #0a0614, 0 0 40px rgba(255,103,200,0.45), 18px 18px 0 rgba(0,0,0,0.55)",
          padding: 22,
          transform: "rotate(-2deg)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fff8dc",
            fontFamily: "Tahoma, Verdana, sans-serif",
            fontSize: "0.74rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              background: "#fff16a",
              color: "#3a1600",
              fontWeight: 700,
              letterSpacing: "0.22em",
            }}
          >
            RATED Y2K
          </span>
          <span style={{ color: "#fff16a" }}>VHS DELUXE EDITION</span>
          <span
            style={{
              padding: "4px 10px",
              background: "#0a0614",
              color: "#73efff",
              border: "2px solid #73efff",
              letterSpacing: "0.22em",
            }}
          >
            TAPE 01
          </span>
        </div>
        <div
          style={{
            position: "relative",
            border: "3px solid #fff8dc",
            padding: "18px 22px",
            background:
              "radial-gradient(circle at 50% 35%, rgba(115,239,255,0.28) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(255,241,106,0.2) 0%, transparent 60%), rgba(10,6,20,0.55)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            color: "#fff8dc",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              padding: "4px 8px",
              background: "#fff16a",
              color: "#3a1600",
              fontFamily: "Impact, sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              transform: "rotate(-6deg)",
            }}
          >
            BEHIND-THE-SCENES INCLUDED
          </div>
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 14,
              padding: "4px 8px",
              background: "#73efff",
              color: "#0a2034",
              fontFamily: "Impact, sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              transform: "rotate(6deg)",
            }}
          >
            GUESTBOOK LIVE
          </div>
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: "Verdana, sans-serif",
                fontSize: "0.78rem",
                letterSpacing: "0.28em",
                color: "#73efff",
              }}
            >
              A Y2K STUMBLE PICTURE
            </p>
            <h1
              style={{
                margin: "0 0 16px",
                fontFamily: "Impact, sans-serif",
                fontSize: "clamp(3.4rem, 10vw, 5.8rem)",
                lineHeight: 0.9,
                color: "#fff8dc",
                textShadow:
                  "4px 4px 0 #7e2fc5, 8px 8px 0 rgba(0,0,0,0.5), 0 0 26px rgba(255,241,106,0.6)",
              }}
            >
              GeoStumble
            </h1>
            <p
              style={{
                margin: "0 auto 22px",
                maxWidth: 440,
                fontFamily: "Georgia, serif",
                fontSize: "1rem",
                lineHeight: 1.55,
                color: "#f5edd6",
              }}
            >
              Starring: random personal homepages. Featuring: live guestbook,
              presence pings, and one suspicious &quot;making of&quot; clip.
            </p>
            <NeonStumbleCta accent="#fff16a" label="Press Play" />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 18,
              display: "flex",
              gap: 2,
            }}
          >
            {Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i % 3 === 0 ? 3 : 1.5,
                  height: 32,
                  background: "#fff8dc",
                  opacity: i % 4 === 0 ? 0.9 : 0.6,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              color: "#fff8dc",
              fontFamily: "Courier New, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
            }}
          >
            SP / 01:59:99
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#fff8dc",
            fontFamily: "Verdana, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.88,
          }}
        >
          <span>workers + jazz + mux</span>
          <span>be kind, rewind</span>
        </div>
      </div>
    </div>
  );
}

function Iteration41LandingJumbotron() {
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
            background:
              "linear-gradient(180deg, #16081f 0%, #05020a 100%)",
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
              ONLINE 03
            </span>
            <span style={{ color: "#73efff", textShadow: "0 0 8px #73efff" }}>
              CH1 // LIVE // NOW SURFING
            </span>
            <span
              style={{
                padding: "4px 10px",
                border: "2px solid #ff67c8",
                color: "#ff67c8",
                textShadow: "0 0 8px #ff67c8",
              }}
            >
              HITS 99
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
              NOW BROADCASTING // RANDOM PERSONAL HOMEPAGES //
              <br />
              ONE CLICK, INSTANT ERA SHOCK
            </p>
            <NeonStumbleCta accent="#ff67c8" />
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
              TICKER // guestbook online // presence stable // mux encoding
              clean // next stumble in 00:00:04 // powered by workers + jazz +
              mux //
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function IterationPage({
  params,
}: {
  params: Promise<{ iterationId: string }>;
}) {
  const { iterationId } = await params;

  if (!VALID_IDS.has(iterationId)) {
    notFound();
  }

  switch (iterationId) {
    case "7":
      return <Iteration7Scroll />;
    case "10":
      return <Iteration10TreasureMap />;
    case "16":
      return <Iteration16StarChartDeluxe />;
    case "22":
      return <Iteration22SailPoster />;
    case "23":
      return <Iteration23RadarDock />;
    case "24":
      return <Iteration24ScrapbookBurst />;
    case "25":
      return <Iteration25PortalOrbit />;
    case "26":
      return <Iteration26QuestPass />;
    case "27":
      return <Iteration27RadarDockStudio />;
    case "28":
      return <Iteration28RadarDockBroadcast />;
    case "29":
      return <Iteration29RadarDockArcade />;
    case "30":
      return <Iteration30RadarDockNewswire />;
    case "31":
      return <Iteration31RadarDockAfterDark />;
    case "32":
      return <Iteration32LandingStation />;
    case "33":
      return <Iteration33LandingNewswire />;
    case "34":
      return <Iteration34LandingArcade />;
    case "35":
      return <Iteration35LandingUnderConstruction />;
    case "36":
      return <Iteration36LandingBillboard />;
    case "37":
      return <Iteration37LandingNeonOrbit />;
    case "38":
      return <Iteration38LandingMidnightCollage />;
    case "39":
      return <Iteration39LandingDialupConstellation />;
    case "40":
      return <Iteration40LandingVhsCover />;
    case "41":
      return <Iteration41LandingJumbotron />;
    default:
      notFound();
  }
}
