import { expect, test } from "@playwright/test";

test("home renders server-side heading", async ({ page }) => {
  await page.goto("/");

  // Step 16: the h1 is the targeted role (US-01), the name sits above it.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Software Engineer & Backend Developer",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(250, 250, 250)");
  await expect(page).toHaveTitle("Rakha Yuda Wicaksono - Software Engineer");
  // The page colour sits on <html> so the dust canvas can paint at z-index -1
  // (a background on <body> covers it).
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(9, 9, 11)");
});

test("document exposes language, landmarks, and metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content", "");

  await expect(page.locator("body > header")).toHaveCount(1);
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("skip link becomes visible on keyboard focus", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeInViewport();
});
