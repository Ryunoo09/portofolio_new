import { expect, test } from "@playwright/test";
import { isProductionBuildAvailable, startProductionServer } from "./support/production-server";

// ISR headers are only observable on a production build; `next dev` sends no-store.
test.describe("production rendering", () => {
  test.skip(
    !isProductionBuildAvailable(),
    "Run `pnpm build` first: this spec needs .next/standalone.",
  );

  let server: { url: string; close: () => void };

  test.beforeAll(async () => {
    server = await startProductionServer();
  });

  test.afterAll(() => {
    server.close();
  });

  test("home page advertises 5 minute revalidation", async ({ request }) => {
    const response = await request.get(`${server.url}/`);

    expect(response.status()).toBe(200);
    // ISR: s-maxage equals the route's revalidate window (PRD: 300 seconds).
    expect(response.headers()["cache-control"] ?? "").toContain("s-maxage=300");
  });

  test("unknown URL renders the site's own not-found page", async ({ request }) => {
    const response = await request.get(`${server.url}/this-page-does-not-exist`);
    const html = await response.text();

    expect(response.status()).toBe(404);
    expect(html).toContain("This page does not exist");
    expect(html).toContain('href="/"');
  });

  test("serves the seed content even when Supabase is not configured", async ({ request }) => {
    // The build in CI (and the local gate) runs without Supabase env on purpose,
    // so this is the R5 fallback path: content/*.json, never a 5xx.
    const response = await request.get(`${server.url}/`);

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toContain("Rakha Yuda Wicaksono");
    expect(html).toContain("Draft Project One");
  });
});
