import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const profile = JSON.parse(readFileSync("content/profile.json", "utf8")) as {
  email_public: string;
};
const socials = JSON.parse(readFileSync("content/social-links.json", "utf8")) as {
  label: string;
  url: string;
}[];

test.describe("contact", () => {
  test("never puts the email address in the server HTML", async ({ page }) => {
    const response = await page.request.get("/");
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html).not.toContain(profile.email_public);
    // Not even a `mailto:` for a scraper to lift: it is assembled on the client.
    expect(html).not.toContain("mailto:");
  });

  test("assembles a working mailto link in the browser", async ({ page }) => {
    await page.goto("/");

    const link = page.getByRole("link", { name: /Email me/ });

    await expect(link).toHaveAttribute("href", `mailto:${profile.email_public}`);
    await expect(link).toBeVisible();
  });

  test("sends every social link to a new tab with noopener", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#contact");

    for (const social of socials) {
      const link = section.getByRole("link", { name: new RegExp(`^${social.label}`) });

      await expect(link).toHaveAttribute("href", social.url);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noreferrer noopener");
      await expect(link).toHaveAccessibleName(/opens in a new tab/);
    }
  });

  test("keeps phone and WhatsApp off until the owner enables them", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#contact");

    await expect(section.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(section.locator('a[href*="wa.me"]')).toHaveCount(0);
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("offers both CV languages from the hero, the header, and contact", async ({ page }) => {
    await page.goto("/");

    const menus = page
      .locator("details:visible")
      .filter({ has: page.locator("summary", { hasText: "Download CV" }) });

    await expect(menus).toHaveCount(3);

    for (const menu of await menus.all()) {
      await menu.locator("summary").click();

      const english = menu.getByRole("link", { name: "Download CV in English" });
      const indonesian = menu.getByRole("link", { name: "Download CV in Indonesian" });

      await expect(english).toBeVisible();
      await expect(indonesian).toBeVisible();
      await expect(english).toHaveAttribute("href", /Fullstack_EN\.pdf$/);
      await expect(indonesian).toHaveAttribute("href", /Fullstack_ID\.pdf$/);

      await menu.locator("summary").click();
    }
  });

  test("stores no message form", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#contact form")).toHaveCount(0);
    await expect(page.locator("#contact textarea")).toHaveCount(0);
  });
});
