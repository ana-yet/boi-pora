import { ImageResponse } from "next/og";

export const alt = "Boi Pora — বই পড়া";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #44403c 100%)",
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 96,
              borderRadius: 8,
              background: "#ea7d10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            📖
          </div>
          <div style={{ fontSize: 88, fontWeight: 700 }}>Boi Pora</div>
        </div>
        <div style={{ fontSize: 40, color: "#d6d3d1" }}>বই পড়া</div>
        <div style={{ fontSize: 28, color: "#a8a29e", marginTop: 24 }}>
          Your digital reading companion
        </div>
      </div>
    ),
    size
  );
}
