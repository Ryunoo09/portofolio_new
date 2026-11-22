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
  it("presents contact as a centered invitation without an eyebrow", () => {
    const { container } = render(<Contact profile={profile} socials={[]} settings={{}} />);

    expect(screen.getByRole("heading", { name: "Get in Touch." })).toBeVisible();
    expect(container.querySelector("#contact-title .contact-gradient")).toHaveTextContent("Touch.");
    expect(screen.queryByText("(006) // GET IN TOUCH")).toBeNull();
    expect(container.querySelector("#contact header")).toHaveClass("text-center");
    expect(screen.getByText(/For project enquiries/)).toBeVisible();
  });

  it("shows round social cards with stored destinations and enabled WhatsApp", () => {
    render(
      <Contact
        profile={profile}
        socials={[github, { ...github, id: "s2", label: "LinkedIn", url: "https://linkedin.com/in/example" }]}
        settings={settingsWith({ whatsapp: "+62 812-3456-7890", whatsapp_public: true })}
      />,
    );

    for (const [name, href] of [
      ["GitHub", "https://github.com/example"],
      ["LinkedIn", "https://linkedin.com/in/example"],
      ["WhatsApp", "https://wa.me/6281234567890"],
    ]) {
      expect(screen.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
      expect(screen.getByRole("link", { name: new RegExp(name) })).toHaveClass("contact-social-card");
    }
  });

  it("builds the mailto in the browser and never prints the address", () => {
    const { container } = render(<Contact profile={profile} socials={[]} settings={{}} />);

    const link = screen.getByRole("link", { name: /Email me/ });

    expect(link).toHaveAttribute("href", "mailto:hello@example.com");
    // The address is not readable text anywhere on the page.
    expect(container.textContent).not.toContain("hello@example.com");
  });

  it("shows an envelope email capsule without CV links", () => {
    const { container } = render(
      <Contact profile={profile} socials={[]} settings={{ cv: { en: "en.pdf", id: "id.pdf" } }} />,
    );

    const email = screen.getByRole("link", { name: /Email me/ });
    expect(email).toHaveClass("contact-email-link");
    expect(email.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: /Download CV/ })).toBeNull();
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
    expect(screen.getByText(/email is temporarily unavailable/i)).toBeVisible();
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

  it("shows enabled WhatsApp but keeps phone number hidden", () => {
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

    expect(screen.queryByRole("link", { name: /Call/ })).toBeNull();
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

  it("omits CV links from Contact", () => {
    render(
      <Contact profile={profile} socials={[]} settings={{ cv: { en: "en.pdf", id: "id.pdf" } }} />,
    );

    expect(screen.queryByRole("link", { name: /Download CV/ })).toBeNull();
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
