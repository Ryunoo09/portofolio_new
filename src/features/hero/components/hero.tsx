import { ButtonLink, Heading } from "@/components/ui";
import { CvDownloadMenu } from "@/components/cv-download-menu";
import { RevealWords } from "@/features/motion";
import type { CvLinks } from "@/lib/cv";
import type { Profile } from "@/types/content";
import { CONTACT_LABEL } from "@/lib/seo";
import { HeroEnter } from "./hero-enter";
import { HeroVisual } from "./hero-visual";

type HeroProps = {
  profile: Profile;
  cv: CvLinks;
};

/**
 * First screen for US-01: who the owner is, which role they target, and the two
 * actions a recruiter needs. All text is server-rendered.
 */
export function Hero({ profile, cv }: HeroProps) {
  return (
    <section
      id="home"
      aria-labelledby="home-owner home-title"
      className="hero-shell"
    >
      <HeroEnter />

      <div className="hero-copy">
        <p id="home-owner" className="hero-owner hero-rise text-fg-muted font-mono text-xs tracking-[0.16em]">
          {profile.full_name}
        </p>

        <Heading level="h1" className="hero-title mt-3">
          <span id="home-title">
            <RevealWords text={profile.headline} />
          </span>
        </Heading>

        <p className="text-fg-muted hero-pitch hero-rise">{profile.tagline ?? profile.summary_short}</p>

        <div className="hero-actions mt-8 flex flex-wrap items-center gap-3">
          <CvDownloadMenu cv={cv} className="hero-cta px-5 py-3" />
          <ButtonLink href="#contact" variant="secondary">
            {CONTACT_LABEL}
          </ButtonLink>
        </div>
      </div>

      <HeroVisual avatarPath={profile.avatar_path} alt={`Portrait of ${profile.full_name}`} />
    </section>
  );
}
