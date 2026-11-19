import { mediaUrl } from "./media";

export type CvLinks = { en: string | null; id: string | null };

function storedPath(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * The two CV files live in the `media` bucket under `site_settings.cv`, keyed by
 * language, so the menu can offer both without a schema change. Values stay
 * relative in the JSON, keeping the environment out of committed content.
 */
export function cvLinks(settings: { cv?: unknown }): CvLinks {
  const cv =
    typeof settings.cv === "object" && settings.cv !== null
      ? (settings.cv as Record<string, unknown>)
      : {};
  const en = storedPath(cv.en);
  const id = storedPath(cv.id);

  return {
    en: en ? mediaUrl(en) : null,
    id: id ? mediaUrl(id) : null,
  };
}
