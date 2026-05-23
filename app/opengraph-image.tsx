import { ImageResponse } from "next/og";

export const alt = "Savar Gupta — hardware, software, and good product taste";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 96,
          background: "#fafaf9",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#1c1917",
              color: "#fafaf9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 46,
              fontWeight: 800,
              letterSpacing: -1.5,
            }}
          >
            SG
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.02,
            }}
          >
            Savar Gupta
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#78716c",
              marginTop: 28,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            Hardware, software, and good product taste — at the seams.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#a8a29e",
          }}
        >
          <div style={{ display: "flex" }}>savargupta.com</div>
          <div style={{ display: "flex" }}>
            TELUS · Unify · writing · projects
          </div>
        </div>
      </div>
    ),
    size,
  );
}
