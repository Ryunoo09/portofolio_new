import { mediaUrl } from "@/lib/media";
import type { SiteSettings } from "@/types/content";

export type MusicTrack = {
  title: string;
  src: string;
  credit: string | null;
  creditUrl: string | null;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function httpUrl(value: unknown): string | null {
  const raw = text(value);

  if (!raw) return null;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * US-07: the player only exists when the owner configured a track. A missing or
 * malformed path returns null, so the layout renders no empty player.
 */
export function musicConfig(settings: SiteSettings): MusicTrack | null {
  const music = settings.music;

  if (!music || typeof music !== "object") return null;

  const record = music as Record<string, unknown>;
  const path = text(record.track_path);

  if (!path) return null;

  return {
    title: text(record.title) ?? "Background music",
    src: mediaUrl(path),
    credit: text(record.credit),
    creditUrl: httpUrl(record.credit_url),
  };
}
