import { expect, test } from "@playwright/test";

const SECTIONS = ["home", "about", "experience", "projects", "skills", "contact"] as const;

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test.describe(`navigation on ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const id of SECTIONS) {
      test(`anchor #${id} lands with the heading clear of the header`, async ({ page }) => {
        await page.goto("/");

        // The anchor jump is handled after hydration. Clicking while the page is
        // still loading lets the native hash lookup run before the sections below
        // have their final height, and the browser then clamps the jump to 0.
        await page.waitForLoadState("networkidle");

        const menuButton = page.getByRole("button", { name: "Menu" });
        if (await menuButton.isVisible()) {
          await menuButton.click();
          const link = page
            .locator("#mobile-menu")
            .getByRole("link", { name: id, exact: false })
            .first();
          await expect(link).toBeVisible();
          await link.click();
        } else {
          await page
            .getByRole("navigation", { name: "Sections" })
            .first()
            .getByRole("link", { name: id, exact: false })
            .click();
        }

        // Smooth scrolling is async, so wait for it to actually happen and then
        // stop. Watching for a stable scrollY alone exits immediately because the
        // first frames are still at scrollY 0 before the animation starts.
        await page.waitForFunction(
          () =>
            new Promise<boolean>((resolve) => {
              let started = false;
              let last = window.scrollY;
              let stableFrames = 0;
              let frames = 0;

              const tick = () => {
                frames += 1;
                if (window.scrollY !== last) {
                  started = true;
                  stableFrames = 0;
                  last = window.scrollY;
                } else if (started) {
                  stableFrames += 1;
                }

                if (stableFrames >= 8) return resolve(true);
                if (frames > 180) return resolve(true);
                requestAnimationFrame(tick);
              };

              requestAnimationFrame(tick);
            }),
          undefined,
          { timeout: 10_000 },
        );

        const header = await page.locator("body > header").boundingBox();
        const section = await page.locator(`#${id}`).boundingBox();
        const heading = await page.locator(`#${id} h1, #${id} h2`).first().boundingBox();

        expect(header).not.toBeNull();
        expect(section).not.toBeNull();
        expect(heading).not.toBeNull();
        // Section top clears the sticky header (scroll-margin-top) and the heading sits below it.
        expect(section!.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0) - 1);
        expect(heading!.y).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0) - 1);
        expect(heading!.y).toBeLessThan(viewport.height);
      });
    }
  });
}

test("mobile menu closes with Escape and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Menu" });
  await trigger.click();

  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  await expect(page.getByRole("link", { name: "Home", exact: true }).last()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("every section link is reachable with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Sections" }).first();

  for (const label of ["Home", "About", "Experience", "Projects", "Skills", "Contact"]) {
    const link = nav.getByRole("link", { name: label, exact: true });
    await link.focus();
    await expect(link).toBeFocused();
  }
});
