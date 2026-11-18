/**
 * Abstract "field" visual: a stack of hairlines lit by one soft accent glow.
 * Pure CSS (no image request), so it costs nothing against the 150 KB hero
 * image budget. Its height comes from `aspect-ratio` in hero-visual.css, which
 * is what keeps layout shift at zero.
 * Purely decorative: the wrapper is aria-hidden.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="hero-visual border-border relative w-full overflow-hidden rounded-[var(--r-lg)] border"
    />
  );
}
