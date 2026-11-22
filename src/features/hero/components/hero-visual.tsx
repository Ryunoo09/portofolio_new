import Image from "next/image";
import { mediaUrl } from "@/lib/media";

/**
 * Abstract "field" visual: a stack of hairlines lit by one soft accent glow.
 * Pure CSS (no image request), so it costs nothing against the 150 KB hero
 * image budget. Its height comes from `aspect-ratio` in hero-visual.css, which
 * is what keeps layout shift at zero.
 * Falls back to the existing CSS visual when no avatar path exists.
 */
export function HeroVisual({ avatarPath, alt }: { avatarPath: string | null; alt: string }) {
  return (
    <div
      className="hero-visual border-border relative w-full overflow-hidden rounded-[var(--r-lg)] border"
      aria-hidden={avatarPath ? undefined : true}
    >
      {avatarPath ? (
        <Image src={mediaUrl(avatarPath)} alt={alt} fill priority sizes="(min-width: 64rem) 320px, (min-width: 48rem) 288px, 100vw" className="object-cover" />
      ) : null}
    </div>
  );
}
