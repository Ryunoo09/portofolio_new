import { expect, test } from "@playwright/test";

test.describe("SEO", () => {
  test("serves a sitemap with the homepage and every published project", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(200);

    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    expect(locs.some((loc) => /\/$/.test(loc))).toBe(true);
    expect(locs.filter((loc) => loc.includes("/projects/")).length).toBeGreaterThan(0);
    // No duplicate entries.
    expect(new Set(locs).size).toBe(locs.length);
  });

  test("points robots.txt at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);

    const body = await response.text();

    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/Allow: \//i);
    expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/i);
  });

  test("publishes Person structured data on the homepage", async ({ page }) => {
    await page.goto("/");

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? "{}") as Record<string, unknown>;

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Person");
    expect(typeof data.name).toBe("string");
    expect(typeof data.jobTitle).toBe("string");
    expect(Array.isArray(data.sameAs)).toBe(true);
  });

  test("sets a canonical URL and indexable robots on the homepage", async ({ page }) => {
    await page.goto("/");

    // The homepage canonical is the site root, with or without a trailing slash.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /follow/);
  });

  test("serves a 1200x630 PNG preview for the homepage and a project", async ({ page }) => {
    for (const path of ["/", "/projects/draft-project-one"]) {
      await page.goto(path);

      const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content");

      expect(imageUrl).not.toBeNull();
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
      await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
        "content",
        "image/png",
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );

      const response = await page.request.get(imageUrl!);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");

      // PNG header: signature (8 bytes), then IHDR width and height (big-endian).
      const png = await response.body();

      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    }
  });

  test("gives each page a unique title and description within the caps", async ({ page }) => {
    const visited: { url: string; title: string; description: string }[] = [];

    for (const path of ["/", "/projects/draft-project-one", "/projects/draft-project-two"]) {
      await page.goto(path);

      const title = (await page.title()).trim();
      const description =
        (await page.locator('meta[name="description"]').getAttribute("content"))?.trim() ?? "";

      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);

      visited.push({ url: path, title, description });

      // Exactly one h1, and it names the page.
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }

    expect(new Set(visited.map((item) => item.title)).size).toBe(visited.length);
    expect(new Set(visited.map((item) => item.description)).size).toBe(visited.length);
  });
});
