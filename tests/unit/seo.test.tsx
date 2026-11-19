import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonJsonLd } from "@/features/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/seo";
import { fallbackProfile, fallbackSocialLinks } from "@/data/fallback";
import type { Profile, SocialLink } from "@/types/content";

/** Reads the JSON-LD payload out of the rendered script element. */
function readJsonLd(profile: Profile, socials: SocialLink[]): Record<string, unknown> {
  const markup = renderToString(<PersonJsonLd profile={profile} socials={socials} />);
  const match = /<script type="application\/ld\+json">([\s\S]*)<\/script>/.exec(markup);

  if (!match) throw new Error("no JSON-LD script found");

  return JSON.parse(match[1]) as Record<string, unknown>;
}

describe("site metadata", () => {
  it("keeps the title within the 60 character cap", () => {
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
  });

  it("keeps the description between 140 and 160 characters", () => {
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(140);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("names the person in the title", () => {
    expect(SITE_TITLE).toContain(SITE_NAME);
  });
});

describe("PersonJsonLd", () => {
  it("describes a Person with the name and job title already on the page", () => {
    const data = readJsonLd(fallbackProfile, fallbackSocialLinks);

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(fallbackProfile.full_name);
    expect(data.jobTitle).toBe(fallbackProfile.headline);
    expect(data.url).toBeTruthy();
  });

  it("lists the public profile URLs as sameAs", () => {
    const data = readJsonLd(fallbackProfile, fallbackSocialLinks);
    const expected = fallbackSocialLinks
      .map((link) => link.url)
      .filter((url) => /^https?:\/\//i.test(url));

    expect(data.sameAs).toEqual(expected);
  });

  it("never lets a stored value break out of the script tag", () => {
    const hostile: Profile = {
      ...fallbackProfile,
      full_name: "</script><script>alert(1)</script>",
    };

    const markup = renderToString(<PersonJsonLd profile={hostile} socials={[]} />);

    // Exactly one closing tag, and the payload text is escaped.
    expect(markup.match(/<\/script>/g)).toHaveLength(1);
    expect(markup).toContain("\\u003c/script");
  });

  it("drops a social URL that is not http(s)", () => {
    const unsafe: SocialLink = { ...fallbackSocialLinks[0], url: "javascript:alert(1)" };

    expect(readJsonLd(fallbackProfile, [unsafe]).sameAs).toEqual([]);
  });
});
