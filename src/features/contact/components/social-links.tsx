import { ButtonLink } from "@/components/ui";
import { isHttpUrl } from "@/lib/url";
import type { SocialLink } from "@/types/content";

type SocialLinksProps = {
  links: SocialLink[];
};

/**
 * US-06: LinkedIn/GitHub in a new tab, with a visible marker and a screen-reader
 * note, because an unexpected new tab is disorienting. A stored URL that is not
 * `http(s)` is dropped rather than rendered.
 */
export function SocialLinks({ links }: SocialLinksProps) {
  const usable = links.filter((link) => isHttpUrl(link.url));

  if (usable.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-3">
      {usable.map((link) => (
        <li key={link.id}>
          <ButtonLink href={link.url} external variant="secondary">
            {link.label}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
