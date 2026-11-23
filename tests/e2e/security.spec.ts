import { expect, test } from "@playwright/test";

test.describe("Security headers", () => {
  test("the homepage response carries every hardening header once", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
  });

  test("the framework version is not advertised", async ({ request }) => {
    const response = await request.get("/");

    expect(response.headers()["x-powered-by"]).toBeUndefined();
  });
});