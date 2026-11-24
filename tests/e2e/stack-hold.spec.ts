import { expect, test } from "@playwright/test";

const PANEL = ".stack-hold-panel";
const CARD = ".stack-hold-card";
const RECEDE = ".stack-hold-panel #skills";

type Snapshot = {
  panelTop: number;
  panelPosition: string;
  cardTop: number;
  cardZ: number;
  cardRadius: string;
  opacity: number;
  transform: string;
  animation: string;
};

/** Reads the tech-stack recede state and the two block positions. */
async function sample(page: import("@playwright/test").Page): Promise<Snapshot> {
  return page.evaluate(
    ({ panel, card, recede }) => {
      const panelEl = document.querySelector(panel);
      const cardEl = document.querySelector(card);
      const recedeEl = document.querySelector(recede);

      if (!panelEl || !cardEl || !recedeEl) throw new Error("stack-hold markup is missing");

      const panelStyle = getComputedStyle(panelEl);
      const cardStyle = getComputedStyle(cardEl);
      const recedeStyle = getComputedStyle(recedeEl);

      return {
        panelTop: Math.round(panelEl.getBoundingClientRect().top),
        panelPosition: panelStyle.position,
        cardTop: Math.round(cardEl.getBoundingClientRect().top),
        cardZ: Number(cardStyle.zIndex),
        cardRadius: cardStyle.borderTopLeftRadius,
        opacity: Number(recedeStyle.opacity),
        transform: recedeStyle.transform,
        animation: recedeStyle.animationName,
      };
    },
    { panel: PANEL, card: CARD, recede: RECEDE },
  );
}

async function scrollToPanel(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    const panel = document.querySelector(".stack-hold-panel");

    if (!panel) throw new Error("no panel");

    window.scrollTo(0, panel.getBoundingClientRect().top + window.scrollY);
  });
  await page.waitForTimeout(250);
}

test.describe("tech stack hands over to contact", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("pins the stack and slides the contact card over it", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await scrollToPanel(page);
    const start = await sample(page);

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(250);
    const middle = await sample(page);

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(250);
    const end = await sample(page);

    expect(start.panelPosition).toBe("sticky");
    // The panel holds its place while the card travels up over it.
    expect(Math.abs(middle.panelTop - start.panelTop)).toBeLessThanOrEqual(2);
    expect(middle.cardTop).toBeLessThan(start.cardTop);
    expect(end.cardTop).toBeLessThanOrEqual(0);

    // The card is the card: raised above the panel, rounded top edge.
    expect(end.cardZ).toBeGreaterThan(0);
    expect(parseFloat(end.cardRadius)).toBeGreaterThan(0);

    // The stack recedes: it dims and shrinks as the card arrives.
    expect(end.opacity).toBeLessThan(start.opacity);
    expect(end.opacity).toBeLessThanOrEqual(0.6);
    expect(end.transform).not.toBe(start.transform);
  });

  test("keeps the stack in flow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await scrollToPanel(page);
    const snapshot = await sample(page);

    expect(snapshot.panelPosition).toBe("static");
    expect(snapshot.animation).toBe("none");
    expect(snapshot.opacity).toBe(1);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("never animates the handover", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await scrollToPanel(page);
      await page.evaluate(() => window.scrollBy(0, 700));
      await page.waitForTimeout(250);

      const snapshot = await sample(page);

      expect(snapshot.animation).toBe("none");
      expect(snapshot.opacity).toBe(1);
      expect(snapshot.transform).toBe("none");
    });
  });
});
