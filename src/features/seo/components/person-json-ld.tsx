import { isHttpUrl } from "@/lib/url";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Profile, SocialLink } from "@/types/content";

type PersonJsonLdProps = {
  profile: Profile;
  socials: SocialLink[];
};

/**
 * `Person` structured data for the homepage (PRD 4.6, KPI-4). Only public facts
 * already on the page are described; `sameAs` is limited to http(s) profiles so a
 * bad stored value cannot become a bogus identity link.
 *
 * The payload is built as a string and injected with `dangerouslySetInnerHTML`,
 * which is safe here because `JSON.stringify` output is escaped for `<` below.
 */
export function PersonJsonLd({ profile, socials }: PersonJsonLdProps) {
  const sameAs = socials.map((social) => social.url).filter(isHttpUrl);

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name || SITE_NAME,
    jobTitle: profile.headline,
    url: SITE_URL,
    sameAs,
    ...(profile.location_text ? { address: { "@type": "PostalAddress", addressLocality: profile.location_text } } : {}),
    ...(profile.summary_short ? { description: profile.summary_short } : {}),
  };

  // `</script>` inside a string would end the tag early, and U+2028/U+2029 are
  // line terminators older parsers choke on. Escaping all three keeps the JSON
  // valid inside the element without changing its meaning.
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw text, not escaped markup, so the payload is injected
      // as-is; it was escaped above and contains no HTML.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
