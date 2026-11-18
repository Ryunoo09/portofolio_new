export const dynamic = "force-static";

/** Liveness probe for Docker and the reverse proxy. Never touches the database. */
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
