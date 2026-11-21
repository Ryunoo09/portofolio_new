import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import { renderMarkdown } from "@/lib/markdown";
import type { Profile } from "@/types/content";

type AboutProps = {
  profile: Profile;
};

/**
 * Bio from `about_md`, rendered as React elements so database text can never
 * inject markup. Falls back to the short summary when the long form is empty.
 * Each paragraph fades in on scroll through `RevealRows`; the text is in the
 * server HTML either way.
 */
export function About({ profile }: AboutProps) {
  const source = profile.about_md?.trim() || profile.summary_short?.trim() || "";

  return (
    <Section id="about" eyebrow="About" title="About" layout="split">
      {source ? (
        <div className="text-fg-muted max-w-[65ch] space-y-4 text-base leading-relaxed">
          <RevealRows selector="p, h2, h3" distance={12} duration={0.5} stagger={0.06} blur={14}>{renderMarkdown(source)}</RevealRows>
        </div>
      ) : (
        <p className="text-fg-muted text-sm">Bio is being written.</p>
      )}
    </Section>
  );
}

