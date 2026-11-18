import { describe, expect, it } from "vitest";
import { formatDateRange, truncate } from "@/lib/format";

describe("formatDateRange", () => {
  it("renders an open-ended range as Present", () => {
    expect(formatDateRange("2024-01-01", null)).toBe("Jan 2024 – Present");
  });

  it("drops the repeated year inside one year", () => {
    expect(formatDateRange("2023-01-01", "2023-12-31")).toBe("Jan – Dec 2023");
  });

  it("renders both years across a year boundary", () => {
    expect(formatDateRange("2022-11-01", "2024-03-31")).toBe("Nov 2022 – Mar 2024");
  });
});

describe("truncate", () => {
  it("leaves short text untouched", () => {
    expect(truncate("Short summary.", 40)).toBe("Short summary.");
  });

  it("cuts on a word boundary and adds an ellipsis", () => {
    const result = truncate("A backend service that replaced a manual workflow.", 24);

    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(24);
    expect(result).not.toContain(" …");
  });
});
