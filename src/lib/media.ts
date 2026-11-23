import { getSupabaseUrlOrNull } from "./env";

const BUCKET = "media";

/**
 * Maps a stored media path to the URL the browser requests.
 *
 * `path` is a Storage object key (e.g. "projects/alpha/cover.webp"), never a full
 * URL: `next.config.ts` allow-lists one host for `next/image`, so a foreign URL
 * would be rejected at render. Public bucket objects need only the project URL,
 * not the anon key. Without Supabase the same path is served from `public/`, so
 * the content/*.json fallback still shows images.
 */
export function mediaUrl(path: string): string {
  const clean = path
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("/");
  const base = getSupabaseUrlOrNull()?.replace(/\/+$/, "");

  return base ? `${base}/storage/v1/object/public/${BUCKET}/${clean}` : `/${clean}`;
}
