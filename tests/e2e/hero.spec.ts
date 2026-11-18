import { expect, test } from "@playwright/test";
import { CV_DOWNLOAD_HREF } from "../../src/lib/cv";

// US-01: a recruiter must see name, role, pitch, and both CTAs without scrolling.
for (const viewport of [
  { name: "laptop 1366x768", width: 1366, height: 768 },
  { name: "phone 390x844", width: 390, height: 844 },
]) {
  test.describe(`hero above the fold on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("shows name, role, pitch, and both CTAs without scrolling", async ({ page }) => {
      await page.goto("/");

      const hero = page.locator("#home");
      await expect(hero).toBeVisible();

      const headline = hero.getByRole("heading", { level: 1 });
      const cv = hero.getByRole("link", { name: "Download CV" });
      const contact = hero.getByRole("link", { name: "Contact" });

      for (const target of [headline, cv, contact]) {
        await expect(target).toBeVisible();
      }

      // Every hero element must sit fully inside the first screen: top edge at or
      // below the sticky header, bottom edge above the viewport bottom.
      const header = await page.locator("body > header").boundingBox();
      const top = (header?.y ?? 0) + (header?.height ?? 0);

      for (const locator of [headline, cv, contact]) {
        const box = await locator.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(top - 1);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
      }

      // Confirms nothing had to be scrolled to reveal them.
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("keeps exactly one h1 on the page", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  });
}

test("hero text is in the server-rendered HTML", async ({ page }) => {
  // The raw HTML already contains the copy, proving it is server-rendered (US-01).
  const response = await page.request.get("/");
  const html = await response.text();

  // Literal strings on purpose: asserting against the same constant the app uses
  // would let a wrong label pass. Mirrors navigation.spec.ts and smoke.spec.ts.
  expect(html).toContain("Software Engineer");
  expect(html).toContain("Download CV");
  expect(html).toContain("Contact");
});

// The CV is the hero's primary action, so a missing file must fail loudly rather
// than ship a dead primary CTA. Skipped until step 29 uploads the real PDF.
test.fixme("the CV download link resolves to a real file", async ({ request }) => {
  const response = await request.get(CV_DOWNLOAD_HREF);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");
});
