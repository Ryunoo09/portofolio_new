import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact, isEmailAddress, toCharCodes } from "@/features/contact";
import type { Profile, SiteSettings } from "@/types/content";

const profile: Profile = {
  id: "p1",
  full_name: "Rakha Yuda Wicaksono",
  headline: "Software Engineer",
  tagline: null,
  summary_short: null,
  about_md: null,
  location_text: null,
  email_public: "hello@example.com",
  avatar_path: null,
  cv_path: null,
};

const github = {
  id: "s1",
  label: "GitHub",
  url: "https://github.com/example",
  icon: null,
  sort_order: 1,
};

function settingsWith(contact: Record<string, unknown>): SiteSettings {
  return { contact };
}

describe("Contact", () => {
  it("builds the mailto in the browser and never prints the address", () => {
    const { container } = render(<Contact profile={profile} socials={[]} settings={{}} />);

    const link = screen.getByRole("link", { name: /Email me/ });

    expect(link).toHaveAttribute("href", "mailto:hello@example.com");
    // The address is not readable text anywhere on the page.
    expect(container.textContent).not.toContain("hello@example.com");
  });

  it("falls back to the profile links when the stored email is unusable", () => {
    render(
      <Contact
        profile={{ ...profile, email_public: "not-an-email" }}
        socials={[github]}
        settings={{}}
      />,
    );

    expect(screen.queryByRole("link", { name: /Email me/ })).toBeNull();
    expect(screen.getByText(/email address is being updated/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /GitHub/ })).toBeVisible();
  });

  it("opens social profiles in a new tab and says so", () => {
    render(<Contact profile={profile} socials={[github]} settings={{}} />);

    const link = screen.getByRole("link", { name: /GitHub/ });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link).toHaveAccessibleName(/opens in a new tab/);
  });

  it("drops a stored link that is not http(s)", () => {
    render(
      <Contact
        profile={profile}
        socials={[{ ...github, url: "javascript:alert(1)" }]}
        settings={{}}
      />,
    );

    expect(screen.queryByRole("link", { name: /GitHub/ })).toBeNull();
  });

  it("keeps phone and WhatsApp hidden unless the owner enables them", () => {
    const { rerender } = render(<Contact profile={profile} socials={[]} settings={{}} />);

    expect(screen.queryByRole("link", { name: /Call/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();

    // A number with the flag still off must stay hidden.
    rerender(
      <Contact
        profile={profile}
        socials={[]}
        settings={settingsWith({ phone: "+62 812-3456-7890", phone_public: false })}
      />,
    );

    expect(screen.queryByRole("link", { name: /Call/ })).toBeNull();
  });

  it("shows a flagged phone and WhatsApp with usable links", () => {
    render(
      <Contact
        profile={profile}
        socials={[]}
        settings={settingsWith({
          phone: "+62 812-3456-7890",
          phone_public: true,
          whatsapp: "+62 812-3456-7890",
          whatsapp_public: true,
        })}
      />,
    );

    expect(screen.getByRole("link", { name: "Call +62 812-3456-7890" })).toHaveAttribute(
      "href",
      "tel:+6281234567890",
    );
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/6281234567890",
    );
  });

  it("omits a flagged number that cannot be dialled", () => {
    render(
      <Contact
        profile={profile}
        socials={[]}
        settings={settingsWith({ phone: "call me", phone_public: true })}
      />,
    );

    expect(screen.queryByRole("link", { name: /Call/ })).toBeNull();
  });

  it("offers the CV download next to the email", () => {
    render(<Contact profile={profile} socials={[]} settings={{}} />);

    const cv = screen.getByRole("link", { name: "Download CV" });

    expect(cv).toHaveAttribute("href", "/cv/rakha-yuda-wicaksono.pdf");
    expect(cv).toHaveAttribute("download", "CV_Rakha-Yuda-Wicaksono.pdf");
  });
});

describe("email helpers", () => {
  it("only accepts a plausible address", () => {
    expect(isEmailAddress("hello@example.com")).toBe(true);
    expect(isEmailAddress("hello@example")).toBe(false);
    expect(isEmailAddress("")).toBe(false);
  });

  it("encodes the address as usable character codes", () => {
    expect(String.fromCharCode(...toCharCodes("a@b.co"))).toBe("a@b.co");
  });
});
