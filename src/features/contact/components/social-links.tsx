import { ButtonLink } from "@/components/ui";
import { isHttpUrl } from "@/lib/url";
import type { SocialLink } from "@/types/content";
import { SocialIcon } from "./social-icon";

type SocialLinksProps = {
  links: SocialLink[];
};

/**
 * US-06: external profiles open in a new tab. A stored URL that is not `http(s)`
 * is dropped rather than rendered.
 */
export function SocialLinks({ links }: SocialLinksProps) {
  const usable = links.filter((link) => isHttpUrl(link.url));

  if (usable.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-5">
      {usable.map((link) => (
        <li key={link.id}>
          <ButtonLink href={link.url} external variant="secondary" className="contact-social-card">
            <SocialIcon label={link.label} />
            <span className="sr-only">{link.label}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
