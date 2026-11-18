import { Section } from "@/components/ui";
import { renderMarkdown } from "@/lib/markdown";
import type { Profile } from "@/types/content";

type AboutProps = {
  profile: Profile;
};

/**
 * Bio from `about_md`, rendered as React elements so database text can never
 * inject markup. Falls back to the short summary when the long form is empty.
 */
export function About({ profile }: AboutProps) {
  const source = profile.about_md?.trim() || profile.summary_short?.trim() || "";

  return (
    <Section id="about" eyebrow="About" title="About">
      {source ? (
        <div className="text-fg-muted max-w-[65ch] space-y-4 text-base leading-relaxed">
          {renderMarkdown(source)}
        </div>
      ) : (
        <p className="text-fg-muted text-sm">Bio is being written.</p>
      )}
    </Section>
  );
}
