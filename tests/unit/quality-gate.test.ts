import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd(), ignore: false });

async function lint(code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((message) => message.ruleId);
}

describe("quality gate", () => {
  it("rejects files over 320 lines", async () => {
    const code = Array.from({ length: 330 }, (_, index) => `const v${index} = ${index};`).join(
      "\n",
    );

    expect(await lint(code, "src/lib/too-long.ts")).toContain("max-lines");
  }, 20_000);

  it("rejects explicit any", async () => {
    expect(await lint("export const x: any = 1;", "src/lib/any.ts")).toContain(
      "@typescript-eslint/no-explicit-any",
    );
  }, 20_000);

  it("rejects direct process.env reads under src/", async () => {
    expect(await lint("export const v = process.env.SECRET;", "src/lib/env-read.ts")).toContain(
      "no-restricted-properties",
    );
  }, 20_000);
});
