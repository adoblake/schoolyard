import { ImageResponse } from "next/og";
import { BRAND, LOGO_HEIGHT, LOGO_LETTERS, LOGO_MARK_SCALE, LOGO_TEXT_OFFSET, LOGO_WIDTH, OUTLINE_PAGES, OUTLINE_RIBBON } from "@/lib/brand";

export const alt = "schoolyard: student classifieds. Buy, sell and trade with verified students at your campus.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLUMNS = [
  ["textbooks", "electronics", "furniture", "dorm / apartment"],
  ["bikes", "tickets", "free stuff", "wanted"],
  ["sublets", "roommates", "tutoring", "lost & found"],
];

/** Share preview: looks like a page of the site itself. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff", padding: "64px 80px", fontFamily: "sans-serif", color: BRAND.ink }}>
        <svg viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`} width={LOGO_WIDTH * 2.6} height={LOGO_HEIGHT * 2.6}>
          <g transform={`scale(${LOGO_MARK_SCALE})`}>
            {OUTLINE_PAGES.map((d) => (
              <path key={d} d={d} fill="#fff" stroke={BRAND.green} strokeWidth={2.2} strokeLinejoin="round" />
            ))}
            <path d={OUTLINE_RIBBON} fill={BRAND.yellow} stroke={BRAND.yellow} strokeWidth={0.6} strokeLinejoin="round" />
          </g>
          <path transform={`translate(${LOGO_TEXT_OFFSET[0]} ${LOGO_TEXT_OFFSET[1]})`} fill={BRAND.green} d={LOGO_LETTERS} />
        </svg>
        <div style={{ display: "flex", marginTop: 18, fontSize: 38, color: "#555" }}>
          student classifieds · verified with your school email
        </div>
        <div style={{ display: "flex", marginTop: 44, background: "#eee", border: "2px solid #ccc", padding: "6px 18px", fontSize: 30 }}>
          buy · sell · trade · free
        </div>
        <div style={{ display: "flex", marginTop: 18, gap: 80 }}>
          {COLUMNS.map((col) => (
            <div key={col[0]} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {col.map((c) => (
                <div key={c} style={{ display: "flex", fontSize: 32, color: "#0000ee" }}>
                  {c}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
