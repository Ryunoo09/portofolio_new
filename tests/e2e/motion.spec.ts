import { expect, test } from "@playwright/test";

const REVEAL_TARGETS = [
  { name: "experience rows", selector: "#experience li", trigger: "#experience" },
  { name: "project rows", selector: "#projects li", trigger: "#projects" },
  { name: "skill groups", selector: "#skills [data-reveal]", trigger: "#skills" },
  { name: "contact actions", selector: "#contact [data-reveal]", trigger: "#contact" },
  { name: "section heading words", selector: "#skills-title [data-word]", trigger: "#skills" },
];

/** Scrolls a section into view and samples the first target while GSAP runs. */
async function sampleReveal(page: import("@playwright/test").Page, selector: string, trigger: string) {
  return page.evaluate(
    async ({ selector, trigger }) => {
      const target = document.querySelector(selector);
      const section = document.querySelector(trigger);

      if (!target || !section) return null;

      const read = () => {
        const style = getComputedStyle(target);
        return { opacity: Number(style.opacity), transform: style.transform };
      };

      // Reset scroll state first so the trigger is genuinely below the fold.
      window.scrollTo(0, 0);

      // Wait for the lazy GSAP import to take over and hide the row; nothing is
      // hidden until then, which is the whole point of the fade-in.
      const deadline = performance.now() + 5000;
      while (read().opacity === 1 && performance.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const hiddenBefore = read().opacity < 1;

      const frames = [];
      section.scrollIntoView({ block: "center" });

      for (let i = 0; i < 20; i += 1) {
        frames.push(read());
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      }

      // 0.6 s animation plus stagger: give it room, then read the resting state.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      return { hiddenBefore, frames, final: read() };
    },
    { selector, trigger },
  );
}

test.describe("scroll reveal", () => {
  for (const { name, selector, trigger } of REVEAL_TARGETS) {
    test(`${name} fade in with transform and opacity only`, async ({ page }) => {
      await page.goto("/");
      // Let hydration and the lazy GSAP import finish before scrolling.
      await page.waitForLoadState("networkidle");

      const result = await sampleReveal(page, selector, trigger);

      expect(result).not.toBeNull();

      const startedHidden = result!.hiddenBefore && result!.frames.some((frame) => frame.opacity < 1);
      const finishedVisible = result!.final.opacity === 1;

      expect(startedHidden).toBe(true);
      expect(finishedVisible).toBe(true);

      // Only translate/scale are ever written to the transform.
      for (const frame of result!.frames) {
        expect(frame.transform).toMatch(/^(none|matrix(3d)?\(|translate)/);
      }
    });
  }

  test("does not move layout while revealing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cls = await page.evaluate(async () => {
      let total = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) total += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });

      for (const id of ["#about", "#experience", "#projects", "#skills", "#contact"]) {
        document.querySelector(id)?.scrollIntoView({ block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      return total;
    });

    expect(cls).toBeLessThan(0.1);
  });

  test("splits a heading into words without changing its name", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("#skills-title");

    await expect(heading).toHaveText("Skills");
    await expect(heading.locator("[data-word]")).not.toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Skills" })).toBeVisible();
  });

  test("scroll-linked decoration follows the scroll position", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const supported = await page.evaluate(() =>
      CSS.supports("(animation-timeline: view()) and (animation-range: entry)"),
    );

    test.skip(!supported, "this browser has no scroll-driven animations");

    const read = () =>
      page.evaluate(() => {
        const hero = document.querySelector(".hero-visual");
        const header = document.querySelector(".section-head");

        return {
          hero: hero ? getComputedStyle(hero).transform : "none",
          shine: header ? getComputedStyle(header, "::after").animationName : "none",
        };
      });

    const atTop = await read();

    await page.evaluate(() => {
      // The page uses smooth scrolling; jump so the sample is deterministic.
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 400);
    });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));

    const scrolled = await read();

    // The decoration is wired to the scroll position, not to a timer.
    expect(atTop.shine).toBe("section-shine");
    expect(scrolled.hero).not.toBe(atTop.hero);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows every section without animating it", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const result = await sampleReveal(page, "#experience li", "#experience");

      expect(result!.frames.every((frame) => frame.opacity === 1)).toBe(true);
      expect(result!.frames.every((frame) => frame.transform === "none")).toBe(true);

      // The decorative scroll effects opt out completely, they do not merely run
      // faster: no animation is attached at all.
      const decoration = await page.evaluate(() => {
        const hero = document.querySelector(".hero-visual");
        const header = document.querySelector(".section-head");

        return {
          hero: hero ? getComputedStyle(hero).transform : "none",
          shine: header ? getComputedStyle(header, "::after").animationName : "none",
        };
      });

      expect(decoration).toEqual({ hero: "none", shine: "none" });
    });
  });

  test("keeps the page usable with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.locator("#experience li").first()).toBeVisible();
    await expect(page.locator("#contact [data-reveal]").first()).toBeVisible();

    await context.close();
  });
});
