import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(parseHex(hex1));
  const lum2 = relativeLuminance(parseHex(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractToken(css: string, token: string): string {
  const match = css.match(new RegExp(`${token}:\\s*([^;]+);`));
  if (!match) throw new Error(`Token ${token} not found in tokens.css`);
  return match[1].trim();
}

describe("Theme & Contrast", () => {
  const tokensPath = resolve(process.cwd(), "src/styles/tokens.css");
  const tokensContent = readFileSync(tokensPath, "utf-8");

  it("defines the gold palette tokens", () => {
    const bg = extractToken(tokensContent, "--bg");
    const accent = extractToken(tokensContent, "--accent");
    const accentFg = extractToken(tokensContent, "--accent-fg");

    expect(bg.toLowerCase()).toBe("#0a0908");
    expect(accent.toLowerCase()).toBe("#d4af37");
    expect(accentFg.toLowerCase()).toBe("#0a0a0a");
  });

  it("ensures --accent against --bg meets WCAG AA (>= 4.5:1)", () => {
    const bg = extractToken(tokensContent, "--bg");
    const accent = extractToken(tokensContent, "--accent");
    const ratio = contrastRatio(accent, bg);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("ensures --accent-fg against --accent meets WCAG AA (>= 4.5:1)", () => {
    const accent = extractToken(tokensContent, "--accent");
    const accentFg = extractToken(tokensContent, "--accent-fg");
    const ratio = contrastRatio(accentFg, accent);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
