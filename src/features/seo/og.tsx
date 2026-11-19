import { ImageResponse } from "next/og";

/**
 * Shared frame for the generated link previews (US-09).
 *
 * Colours mirror `src/styles/tokens.css`: satori has no access to CSS custom
 * properties, so these are the one place the hex values are repeated.
 * The type is satori's built-in font on purpose — bundling a .ttf would add a
 * licensed binary and a standalone-build failure mode for decoration only.
 */
const OG_BG = "#09090b";
const OG_FG = "#fafafa";
const OG_MUTED = "#a1a1aa";
const OG_ACCENT = "#a3e635";
const OG_RULE = "#27272a";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgImage = {
  /** Small accent line above the title. */
  eyebrow: string;
  title: string;
  /** One line at the bottom left: what the link is about. */
  footer: string;
  /** Bottom right: the site or the project facts. */
  note: string;
};

export function renderOgImage({ eyebrow, title, footer, note }: OgImage) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "40px",
          padding: "72px",
          backgroundColor: OG_BG,
          color: OG_FG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: 56, height: 4, backgroundColor: OG_ACCENT }} />
          <div
            style={{
              display: "flex",
              color: OG_ACCENT,
              fontSize: 26,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 28 ? 64 : 84,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "32px",
            borderTop: `1px solid ${OG_RULE}`,
            paddingTop: "28px",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex", color: OG_MUTED, maxWidth: "880px", fontSize: 22, lineHeight: 1.4 }}>
            {footer}
          </div>
          <div style={{ display: "flex", color: OG_FG, whiteSpace: "nowrap", flexShrink: 0 }}>
            {note}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}