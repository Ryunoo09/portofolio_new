import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { About } from "@/features/about";
import type { Profile } from "@/types/content";

const base: Profile = {
  id: "11111111-1111-4111-8111-111111111111",
  full_name: "Rakha Yuda Wicaksono",
  headline: "Software Engineer",
  tagline: "Tagline.",
  summary_short: "Short summary.",
  about_md: "First paragraph.\n\nSecond paragraph with **emphasis**.",
  location_text: "Indonesia",
  email_public: "hello@example.com",
  avatar_path: null,
  cv_path: null,
};

describe("About", () => {
  it("renders each paragraph of the bio", () => {
    const { container } = render(<About profile={base} />);

    const paragraphs = container.querySelectorAll("p");

    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("emphasis").tagName).toBe("STRONG");
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it("falls back to the short summary when about_md is empty", () => {
    render(<About profile={{ ...base, about_md: "   " }} />);

    expect(screen.getByText("Short summary.")).toBeInTheDocument();
  });

  it("shows a placeholder when both about_md and summary are empty", () => {
    render(<About profile={{ ...base, about_md: null, summary_short: null }} />);

    expect(screen.getByText("Bio is being written.")).toBeInTheDocument();
  });

  it("names its section with a level-two heading", () => {
    render(<About profile={base} />);

    expect(screen.getByRole("region", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "About" })).toBeInTheDocument();
  });
});
