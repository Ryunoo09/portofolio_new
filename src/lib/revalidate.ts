import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time secret comparison (US-10). Hashing first gives both sides the
 * same length, which `timingSafeEqual` requires, and hides how long the real
 * secret is.
 */
export function secretsMatch(provided: string, expected: string): boolean {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();

  return timingSafeEqual(left, right);
}

/**
 * Only routes the site actually renders may be revalidated: the homepage and
 * project detail pages. Anything else (including traversal attempts) is
 * rejected, so the endpoint can never be used to rebuild arbitrary paths.
 */
const ALLOWED_PATH = /^\/(?:projects\/[a-z0-9-]+)?$/;

export function isAllowedPath(path: unknown): path is string {
  return typeof path === "string" && path.length <= 120 && ALLOWED_PATH.test(path);
}