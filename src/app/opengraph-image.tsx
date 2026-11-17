import { ImageResponse } from "next/og";

export const alt = "SchoolYard: buy, sell and trade with verified students at your campus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafafa",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#09090b" }}>SchoolYard</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#09090b", lineHeight: 1.05, maxWidth: 980 }}>
            The marketplace for your campus.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 34, color: "#52525b" }}>
            Buy, sell and trade with verified students.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["textbooks", "dorm furniture", "electronics", "free stuff"].map((t) => (
            <div key={t} style={{ display: "flex", border: "2px solid #d4d4d8", borderRadius: 999, padding: "10px 24px", fontSize: 28, color: "#3f3f46", background: "#ffffff" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
