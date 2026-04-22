export default function StumblePage() {
  const personaId = "dave-001";
  const iframeUrl = `https://geostumble-worker.eliothfraijo.workers.dev/p/${personaId}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 12%, #1f1630 0%, #05050a 62%)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          background: "linear-gradient(180deg, #191223 0%, #08070d 100%)",
          border: "3px solid #57406f",
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
              background: "linear-gradient(180deg, #ddd3f4 0%, #9f8bbb 100%)",
              borderBottom: "2px solid #4d3d66",
              color: "#1b1330",
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
                background: "linear-gradient(180deg, #ff67c8 0%, #7e2fc5 100%)",
                border: "2px solid #3f165d",
                color: "#fff8dc",
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
                  background: "#73efff",
                  boxShadow: "0 0 8px #73efff",
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
                border: "2px solid #c89eff",
                boxShadow: "0 0 0 2px #02050b, 0 0 28px rgba(200,158,255,0.46)",
                background: "radial-gradient(circle at 50% 30%, #2c1f51 0%, #090815 90%)",
                position: "relative",
                overflow: "hidden",
                display: "grid",
                gridTemplateRows: "44px 1fr",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #fff16a 0%, #ff67c8 50%, #7e2fc5 100%)",
                  color: "#1f0f2f",
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
                    background: "#fff16a",
                    boxShadow: "0 0 8px #fff16a",
                    animation: "geostumble-blink 0.9s steps(2, start) infinite",
                  }}
                />
                UNDER CONSTRUCTION - neon mode enabled.
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
                    border: "2px solid rgba(255,255,255,0.4)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      background: "rgba(0, 0, 0, 0.7)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      color: "#d3ffff",
                      fontFamily: "Courier New, monospace",
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                      padding: "4px 6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {personaId}
                  </div>
                  <iframe
                    title={`GeoStumble persona ${personaId}`}
                    src={iframeUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0,
                      background: "#000",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                border: "2px solid #8f74b3",
                background: "linear-gradient(180deg, #2d1d45 0%, #140d22 100%)",
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
                    color: "#ff9f1a",
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
                    <strong style={{ color: "#ff67c8" }}>neo</strong>: after dark social room
                  </p>
                </div>
                <p style={{ margin: "10px 0 0", font: "0.7rem Tahoma, Verdana, sans-serif", color: "#cdb8e8" }}>
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
                  <p style={{ margin: 0, color: "#b4bed1" }}>rewinding tape... loading behind-the-scenes clip</p>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.18)",
              color: "#cbb7e8",
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
              <span style={{ display: "inline-block", animation: "geostumble-marquee 9s linear infinite" }}>
                powered by workers + jazz + mux // retro social internet in one room //
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
