import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/features/hero";
import { CONTACT_LABEL } from "@/lib/seo";
import type { Profile } from "@/types/content";

const CV = { en: "/cv/en.pdf", id: "/cv/id.pdf" };

const TAGLINE = "I build reliable web systems with clean interfaces and data that holds up.";
const SUMMARY = "Software engineer focused on backend systems, data, and interfaces.";

const profile: Profile = {
  id: "11111111-1111-4111-8111-111111111111",
  full_name: "Rakha Yuda Wicaksono",
  headline: "Software Engineer",
  tagline: TAGLINE,
  summary_short: SUMMARY,
  about_md: "Draft.",
  avatar_path: null,
  cv_path: null,
  email_public: "hello@example.com",
  location_text: "Indonesia",
};

describe("Hero", () => {
  it("renders exactly one level-one heading carrying the role title", () => {
    render(<Hero profile={profile} cv={CV} />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Software Engineer");
  });

  it("shows the name, the value sentence, and both CTAs", () => {
    render(<Hero profile={profile} cv={CV} />);

    expect(screen.getByText(profile.full_name)).toBeInTheDocument();
    expect(screen.getByText(TAGLINE)).toBeInTheDocument();
    expect(screen.getByText("Download CV")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: CONTACT_LABEL })).toHaveAttribute("href", "#contact");
  });

  it("offers the CV in both languages instead of navigating to one file", () => {
    render(<Hero profile={profile} cv={CV} />);

    expect(screen.getByRole("link", { name: "Download CV in English" })).toHaveAttribute(
      "href",
      "/cv/en.pdf",
    );
    expect(screen.getByRole("link", { name: "Download CV in Indonesian" })).toHaveAttribute(
      "href",
      "/cv/id.pdf",
    );
  });

  it("falls back to the short summary when the tagline is empty", () => {
    render(<Hero profile={{ ...profile, tagline: null }} cv={CV} />);

    expect(screen.getByText(SUMMARY)).toBeInTheDocument();
  });

  it("names the section landmark after both the owner and the role", () => {
    render(<Hero profile={profile} cv={CV} />);

    // A <section> only becomes a landmark once it has an accessible name, so this
    // asserts the labelling and the landmark role in one go.
    expect(
      screen.getByRole("region", { name: "Rakha Yuda Wicaksono Software Engineer" }),
    ).toBeInTheDocument();
  });

  it("keeps the decorative visual out of the accessibility tree", () => {
    const { container } = render(<Hero profile={profile} cv={CV} />);

    const visual = container.querySelector(".hero-visual");

    expect(visual).not.toBeNull();
    expect(visual).toHaveAttribute("aria-hidden", "true");
  });
});
