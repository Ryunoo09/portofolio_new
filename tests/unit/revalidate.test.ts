import { describe, expect, it } from "vitest";
import { isAllowedPath, secretsMatch } from "@/lib/revalidate";

describe("secretsMatch", () => {
  it("accepts the exact secret and rejects everything else", () => {
    expect(secretsMatch("correct-horse-battery", "correct-horse-battery")).toBe(true);
    expect(secretsMatch("correct-horse-batterY", "correct-horse-battery")).toBe(false);
    expect(secretsMatch("", "correct-horse-battery")).toBe(false);
    // Length must not leak: different lengths are compared through hashes.
    expect(secretsMatch("a", "a much longer secret value")).toBe(false);
  });
});

describe("isAllowedPath", () => {
  it("allows the homepage and project detail paths", () => {
    expect(isAllowedPath("/")).toBe(true);
    expect(isAllowedPath("/projects/validasi-ftth-yolo26-paddleocr")).toBe(true);
  });

  it("rejects anything the site does not render", () => {
    for (const path of [
      "",
      "/admin",
      "/projects",
      "/projects/",
      "/projects/Draft-One",
      "/projects/one/two",
      "/projects/../admin",
      "//evil.example",
      "/projects/%2e%2e/admin",
      null,
      undefined,
      42,
      { path: "/" },
      `/${"a".repeat(200)}`,
    ]) {
      expect(isAllowedPath(path), String(path)).toBe(false);
    }
  });
});