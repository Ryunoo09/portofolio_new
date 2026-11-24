import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Profile, SiteSettings, SocialLink } from "@/types/content";
import { publicWhatsapp, whatsappHref } from "../channels";
import { isEmailAddress, toCharCodes } from "../email";
import { EmailLink } from "./email-link";
import { SocialLinks } from "./social-links";
import "../contact.css";

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
  const whatsapp = publicWhatsapp(settings);

  return (
    <Section
      id="contact"
      title={<ContactHeading />}
      description="For project enquiries or professional opportunities, get in touch by email or through my profiles."
      align="center"
      className="py-20 sm:py-28"
    >
      <RevealRows selector="[data-reveal]" distance={22} duration={0.6} stagger={0.08}>
        <div className="flex flex-col items-center gap-8" data-reveal>
          <div className="flex flex-wrap justify-center gap-3">
            {hasEmail && <EmailLink codes={toCharCodes(email)} />}
          </div>

          <SocialLinks
            links={[
              ...socials,
              ...(whatsapp
                ? [
                    {
                      id: "whatsapp",
                      label: "WhatsApp",
                      url: whatsappHref(whatsapp),
                      icon: null,
                      sort_order: Number.MAX_SAFE_INTEGER,
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {!hasEmail && (
          <p className="text-fg-muted mt-4 max-w-[60ch] text-sm" data-reveal>
            Email is temporarily unavailable. You can reach me through the links below.
          </p>
        )}

      </RevealRows>

      {/* Outside the reveal wrapper, so it keeps its own spacer spacing. */}
      <noscript>
        <p className="text-fg-muted mt-6 max-w-[60ch] text-sm">
          Enable JavaScript to reveal the email link, or contact me through one of the profile links above.
        </p>
      </noscript>
    </Section>
  );
}

function ContactHeading() {
  return (
    <>
      Get in <span className="contact-gradient">Touch.</span>
    </>
  );
}
