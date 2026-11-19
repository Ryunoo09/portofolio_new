import { revalidatePath } from "next/cache";
import { getRevalidateSecret } from "@/lib/env";
import { isAllowedPath, secretsMatch } from "@/lib/revalidate";

/**
 * On-demand ISR for content edits (US-10). POST only, secret required, and the
 * path must be one the site renders. The secret lives in the env, never in the
 * client bundle.
 */

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function providedSecret(request: Request): string {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) return authorization.slice("Bearer ".length);

  return request.headers.get("x-revalidate-secret") ?? "";
}

async function requestedPath(request: Request): Promise<unknown> {
  const text = await request.text();

  if (!text.trim()) return "/";

  try {
    const body: unknown = JSON.parse(text);

    if (typeof body !== "object" || body === null) return null;

    return "path" in body ? body.path : "/";
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const expected = getRevalidateSecret();

  if (!expected) {
    return json({ ok: false, error: "revalidate is not configured" }, 503);
  }

  if (!secretsMatch(providedSecret(request), expected)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const path = await requestedPath(request);

  if (!isAllowedPath(path)) {
    return json({ ok: false, error: "path is not allowed" }, 400);
  }

  revalidatePath(path);

  return json({ ok: true, revalidated: [path] }, 200);
}