import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const audioFixture = readFileSync("tests/e2e/fixtures/silence.mp3");

async function allowAudio(page: import("@playwright/test").Page) {
  await page.route("**/Light_by_ro.mp3", (route) =>
    route.fulfill({ status: 200, contentType: "audio/mpeg", body: audioFixture }),
  );
}

test.describe("music player", () => {
  test("does not request the audio file before play", async ({ page }) => {
    const requests: string[] = [];

    page.on("request", (request) => {
      if (request.url().includes("Light_by_ro.mp3")) requests.push(request.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const player = page.getByRole("complementary", { name: "Background music" });

    await expect(player).toBeVisible();
    await expect(player.locator("audio")).toHaveAttribute("preload", "none");
    await expect(player.getByRole("button", { name: "Play background music" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(requests).toHaveLength(0);
  });

  test("starts only after the play button is pressed", async ({ page }) => {
    await allowAudio(page);
    await page.goto("/");

    const play = page.getByRole("button", { name: "Play background music" });
    const request = page.waitForRequest(/Light_by_ro\.mp3/);

    await play.click();
    await request;

    await expect(page.getByRole("button", { name: "Pause background music" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("is operable from the keyboard", async ({ page }) => {
    await allowAudio(page);
    await page.goto("/");

    const play = page.getByRole("button", { name: "Play background music" });

    await play.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "Pause background music" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("restores preferences but still starts paused", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("music-volume", "0.2");
      localStorage.setItem("music-muted", "1");
    });
    await page.reload();

    const audio = page.getByRole("complementary", { name: "Background music" }).locator("audio");

    await expect
      .poll(() => audio.evaluate((element) => (element as HTMLAudioElement).volume))
      .toBe(0.2);
    await expect(audio).toHaveJSProperty("muted", true);
    await expect(audio).toHaveJSProperty("paused", true);
    await page.getByRole("button", { name: "Expand music player" }).click();
    await expect(page.getByRole("button", { name: "Unmute music" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("shows the required credit in the player", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Expand music player" }).click();
    const credit = page.getByRole("link", { name: "Lights — RoaMusic" });

    await expect(credit).toHaveAttribute(
      "href",
      "https://breakingcopyright.com/song/roa-lights",
    );
    await expect(credit).toHaveAttribute("target", "_blank");
  });
});

test.describe("music player on mobile", () => {
  test.use({ viewport: { width: 320, height: 844 }, hasTouch: true, isMobile: true });

  test("fits inside the viewport", async ({ page }) => {
    await page.goto("/");

    const box = await page
      .getByRole("complementary", { name: "Background music" })
      .boundingBox();

    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    await expect(page.getByRole("slider", { name: "Playback position" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Expand music player" })).toBeVisible();
    await page.getByRole("button", { name: "Expand music player" }).click();
    await expect(page.getByRole("slider", { name: "Playback position" })).toBeVisible();
    const expanded = await page.getByRole("complementary", { name: "Background music" }).boundingBox();
    expect(expanded).not.toBeNull();
    expect(expanded!.x + expanded!.width).toBeLessThanOrEqual(320);
    expect(expanded!.y + expanded!.height).toBeLessThanOrEqual(844);
    await expect(page.getByRole("button", { name: "Previous track" })).toBeVisible();
    await expect(page.getByRole("slider", { name: "Music volume" })).toBeVisible();
  });
});
