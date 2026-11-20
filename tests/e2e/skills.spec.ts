import { expect, test } from "@playwright/test";

test.describe("skills", () => {
  test("lists every skill under its category, once for a screen reader", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#skills");

    await expect(section.getByRole("heading", { level: 2, name: "Skills" })).toBeVisible();

    for (const category of ["Languages", "Frameworks & Libraries", "Databases", "Tools & Platforms"]) {
      await expect(section.getByRole("heading", { level: 3, name: category })).toBeVisible();
    }

    // The marquee copy is aria-hidden, so the accessibility tree holds one name.
    const exposed = (await section.getByRole("listitem").allTextContents()).map((text) =>
      text.trim(),
    );

    for (const name of ["TypeScript", "Laravel", "PostgreSQL", "Docker"]) {
      expect(exposed.filter((text) => text === name)).toHaveLength(1);
    }
  });

  test("stops and restarts the marquee with its button", async ({ page }) => {
    await page.goto("/");

    const track = page.locator(".skills-marquee-track");
    const toggle = page.locator(".skills-marquee-toggle");

    expect(await track.evaluate((node) => getComputedStyle(node).animationName)).toBe(
      "skills-marquee",
    );

    await expect(toggle).toHaveAccessibleName("Pause skills animation");
    await toggle.click();

    await expect(toggle).toHaveAccessibleName("Resume skills animation");
    await expect
      .poll(() => track.evaluate((node) => getComputedStyle(node).animationPlayState))
      .toBe("paused");

    // Move off the strip, then resume: the control must work both ways, which a
    // hover-pause rule on the button's own container would silently break.
    await page.mouse.move(2, 2);
    await toggle.click();

    await expect(toggle).toHaveAccessibleName("Pause skills animation");
    await expect
      .poll(() => track.evaluate((node) => getComputedStyle(node).animationPlayState))
      .toBe("running");
  });

  test("pauses the marquee on hover", async ({ page }) => {
    await page.goto("/");

    const track = page.locator(".skills-marquee-track");

    // Hover the window: the track itself never stops moving, so it is not a
    // stable hover target for Playwright.
    await page.locator(".skills-marquee-window").hover();

    await expect
      .poll(() => track.evaluate((node) => getComputedStyle(node).animationPlayState))
      .toBe("paused");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("renders the marquee static and hides the pause control", async ({ page }) => {
      await page.goto("/");

      const track = page.locator(".skills-marquee-track");

      expect(await track.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
      await expect(page.getByRole("button", { name: /skills animation/ })).toBeHidden();
      // The names stay on screen and readable.
      await expect(page.locator(".skills-marquee-track")).toContainText("TypeScript");
    });
  });

  test("keeps the section readable with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 3, name: "Languages" })).toBeVisible();

    const exposed = (await page.locator("#skills").getByRole("listitem").allTextContents()).map(
      (text) => text.trim(),
    );

    expect(exposed.filter((text) => text === "TypeScript")).toHaveLength(1);

    await context.close();
  });
});
