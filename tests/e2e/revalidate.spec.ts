import { expect, test } from "@playwright/test";

/**
 * `/api/revalidate` is the only write-ish entry point, so the tests care about
 * the rejections as much as the success: no secret, wrong secret, arbitrary
 * path, and a non-POST method must all fail.
 */

const SECRET = "e2e-revalidate-secret";

test.describe("revalidate endpoint", () => {
  test("rejects GET", async ({ request }) => {
    const response = await request.get("/api/revalidate");

    expect(response.status()).toBe(405);
  });

  test("rejects a missing or wrong secret", async ({ request }) => {
    const missing = await request.post("/api/revalidate", { data: { path: "/" } });
    const wrong = await request.post("/api/revalidate", {
      data: { path: "/" },
      headers: { authorization: "Bearer not-the-secret" },
    });

    expect(missing.status()).toBe(401);
    expect(wrong.status()).toBe(401);
    await expect(missing.json()).resolves.toEqual({ ok: false, error: "unauthorized" });
  });

  test("rejects a path the site does not render", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { path: "/admin" },
      headers: { authorization: `Bearer ${SECRET}` },
    });

    expect(response.status()).toBe(400);
  });

  test("revalidates the homepage with the secret", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { path: "/" },
      headers: { authorization: `Bearer ${SECRET}` },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, revalidated: ["/"] });
  });

  test("revalidates a project page through the header instead of the body", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { path: "/projects/draft-project-one" },
      headers: { "x-revalidate-secret": SECRET },
    });

    expect(response.status()).toBe(200);
  });
});