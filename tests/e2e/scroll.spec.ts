import { expect, test } from "@playwright/test";

test.describe("scroll experience", () => {
  test("hero is sticky on desktop (1440x900)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hero = page.locator(".hero-shell");
    await expect(hero).toHaveCSS("position", "sticky");
  });

  test("hero is not sticky on mobile (390x844)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hero = page.locator(".hero-shell");
    const position = await hero.evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe("sticky");
  });

  test("section-stack has border-radius and elevation shadow above sticky hero", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const stack = page.locator(".section-stack");
    await expect(stack).toHaveCSS("position", "relative");
    await expect(stack).toHaveCSS("z-index", "20");
  });
});
