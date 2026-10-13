import { ImageResponse } from "next/og";
export const alt =
  "Bumbu Pawon — Grosir dan supplier kebutuhan dapur di Ponorogo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fafbf7",
          padding: "70px",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#164c34",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <svg
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#164c34"
            strokeWidth="1.6"
          >
            <path d="M20 4C11 3 4 7 4 13a7 7 0 0 0 7 7c6 0 10-7 9-16Z" />
            <path d="m4 20 11-11" />
          </svg>
          BUMBU PAWON
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 74,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.13,
          }}
        >
          <span>Dari dapur rumah</span>
          <span>sampai dapur usaha.</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 23,
            borderTop: "1px solid #bac7b5",
            paddingTop: 26,
          }}
        >
          <span>Sayur · Bumbu · Buah · Sembako</span>
          <span>Jetis, Ponorogo · 0878-9261-4999</span>
        </div>
      </div>
    ),
    size,
  );
}
