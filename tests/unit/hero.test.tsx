import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/features/hero";
import { CONTACT_LABEL, CV_LABEL } from "@/lib/seo";
import { CV_DOWNLOAD_HREF, CV_FILE_NAME } from "@/lib/cv";
import type { Profile } from "@/types/content";

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
    render(<Hero profile={profile} />);

    const headings = screen.getAllByRole("heading", { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Software Engineer");
  });

  it("shows the name, the value sentence, and both CTAs", () => {
    render(<Hero profile={profile} />);

    expect(screen.getByText(profile.full_name)).toBeInTheDocument();
    expect(screen.getByText(TAGLINE)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: CV_LABEL })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: CONTACT_LABEL })).toHaveAttribute("href", "#contact");
  });

  it("downloads the CV instead of navigating to it", () => {
    render(<Hero profile={profile} />);

    const cv = screen.getByRole("link", { name: CV_LABEL });

    expect(cv).toHaveAttribute("href", CV_DOWNLOAD_HREF);
    expect(cv).toHaveAttribute("download", CV_FILE_NAME);
  });

  it("falls back to the short summary when the tagline is empty", () => {
    render(<Hero profile={{ ...profile, tagline: null }} />);

    expect(screen.getByText(SUMMARY)).toBeInTheDocument();
  });

  it("names the section landmark after both the owner and the role", () => {
    render(<Hero profile={profile} />);

    // A <section> only becomes a landmark once it has an accessible name, so this
    // asserts the labelling and the landmark role in one go.
    expect(
      screen.getByRole("region", { name: "Rakha Yuda Wicaksono Software Engineer" }),
    ).toBeInTheDocument();
  });

  it("keeps the decorative visual out of the accessibility tree", () => {
    const { container } = render(<Hero profile={profile} />);

    const visual = container.querySelector(".hero-visual");

    expect(visual).not.toBeNull();
    expect(visual).toHaveAttribute("aria-hidden", "true");
  });
});
