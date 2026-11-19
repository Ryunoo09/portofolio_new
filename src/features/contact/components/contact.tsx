import { CvDownloadLink } from "@/components/cv-download-link";
import { ButtonLink, Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Profile, SiteSettings, SocialLink } from "@/types/content";
import { publicPhone, publicWhatsapp, telHref, whatsappHref } from "../channels";
import { isEmailAddress, toCharCodes } from "../email";
import { EmailLink } from "./email-link";
import { SocialLinks } from "./social-links";

type ContactProps = {
  profile: Profile;
  socials: SocialLink[];
  settings: SiteSettings;
};

/**
 * Contact (US-06): one click to email, one to download the CV, plus the profiles
 * a recruiter checks. No form: nothing is stored, so nothing can leak or be
 * spammed (NG-03).
 *
 * The email is passed as character codes, never as text, so the address is not
 * in the server HTML. Phone and WhatsApp render only when the owner enables
 * them in `site_settings` (default off).
 */
export function Contact({ profile, socials, settings }: ContactProps) {
  const email = profile.email_public?.trim() ?? "";
  const hasEmail = isEmailAddress(email);
  const phone = publicPhone(settings);
  const whatsapp = publicWhatsapp(settings);

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Contact"
      description="Open to software engineering roles. Email is the fastest way to reach me."
    >
      <RevealRows selector="[data-reveal]">
        <div className="flex flex-wrap items-center gap-3" data-reveal>
          {hasEmail && <EmailLink codes={toCharCodes(email)} />}
          <CvDownloadLink />
        </div>

        {!hasEmail && (
          <p className="text-fg-muted mt-4 max-w-[60ch] text-sm" data-reveal>
            The email address is being updated. The links below still reach me.
          </p>
        )}

        <div className="mt-8" data-reveal>
          <SocialLinks links={socials} />
        </div>

        {(phone || whatsapp) && (
          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            {phone && (
              <ButtonLink href={telHref(phone)} variant="ghost" aria-label={`Call ${phone}`}>
                {phone}
              </ButtonLink>
            )}
            {whatsapp && (
              <ButtonLink href={whatsappHref(whatsapp)} external variant="ghost">
                WhatsApp
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            )}
          </div>
        )}
      </RevealRows>

      {/* Outside the reveal wrapper, so it keeps its own spacer spacing. */}
      <noscript>
        <p className="text-fg-muted mt-6 max-w-[60ch] text-sm">
          The email button needs JavaScript to hide the address from scrapers. Enable it, or use
          the profile links above.
        </p>
      </noscript>
    </Section>
  );
}
