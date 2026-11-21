import { expect, test } from "@playwright/test";

test.describe("skills", () => {
  test("lists every skill for a screen reader", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#skills");

    await expect(section.getByRole("heading", { level: 2, name: "Tech Stack" })).toBeVisible();

    // The marquee copy is aria-hidden, so the accessibility tree holds one name.
    const exposed = (await section.getByRole("listitem").allTextContents()).map((text) =>
      text.trim(),
    );

    for (const name of ["TypeScript", "Laravel", "PostgreSQL", "Docker"]) {
      expect(exposed.filter((text) => text === name)).toHaveLength(1);
    }
  });

  test("keeps both marquee tracks moving under the pointer", async ({ page }) => {
    await page.goto("/");

    const tracks = page.locator(".skills-marquee-track");

    expect(await tracks.first().evaluate((node) => getComputedStyle(node).animationName)).toBe(
      "skills-marquee",
    );
    expect(await tracks.nth(1).evaluate((node) => getComputedStyle(node).animationDirection)).toBe(
      "reverse",
    );

    // Owner decision: the strip is decoration and must never stop just because
    // the pointer rests on it.
    await page.locator(".skills-marquee-window").hover();
    await expect
      .poll(() => tracks.first().evaluate((node) => getComputedStyle(node).animationPlayState))
      .toBe("running");
    await expect
      .poll(() => tracks.nth(1).evaluate((node) => getComputedStyle(node).animationPlayState))
      .toBe("running");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("renders the marquee static", async ({ page }) => {
      await page.goto("/");

      const tracks = page.locator(".skills-marquee-track");

      expect(await tracks.first().evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
      expect(await tracks.nth(1).evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
      // The names stay on screen and readable.
      await expect(tracks.first()).toContainText("TypeScript");
    });
  });

  test("keeps the section readable with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 2, name: "Tech Stack" })).toBeVisible();

    const exposed = (await page.locator("#skills").getByRole("listitem").allTextContents()).map(
      (text) => text.trim(),
    );

    expect(exposed.filter((text) => text === "TypeScript")).toHaveLength(1);

    await context.close();
  });
});
