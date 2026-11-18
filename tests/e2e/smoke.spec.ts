import { expect, test } from "@playwright/test";

test("home renders server-side heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Portfolio");
  await expect(page).toHaveTitle(/Portfolio/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(250, 250, 250)");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(9, 9, 11)");
});
