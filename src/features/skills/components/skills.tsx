import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Skill } from "@/types/content";
import { SkillsMarquee } from "./skills-marquee";

type SkillsProps = {
  skills: Skill[];
};

/**
 * Tech Stack (US-05).
 *
 * Visually displays technologies as interactive chip marquees with icons (Gambar 1).
 * The old static multi-column list (Gambar 2) is removed per owner request.
 * Accessible list is preserved via `<ul className="sr-only">` for screen readers.
 */
export function Skills({ skills }: SkillsProps) {
  return (
    <Section
      id="skills"
      title="Tech Stack"
      description="Tools and technologies I use to bring ideas to life. Always learning, always evolving."
      align="center"
    >
      {skills.length === 0 ? (
        <p className="text-fg-muted text-sm text-center">Skills are being added.</p>
      ) : (
        <>
          {/* Accessible list for screen readers and search engines */}
          <ul className="sr-only">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>

          <RevealRows selector="[data-reveal]" distance={18} duration={0.6} stagger={0.08}>
            <div data-reveal className="w-full">
              <SkillsMarquee skills={skills} />
            </div>
          </RevealRows>
        </>
      )}
    </Section>
  );
}
