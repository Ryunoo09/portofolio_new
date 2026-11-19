import { Section } from "@/components/ui";
import { RevealRows } from "@/features/motion";
import type { Skill } from "@/types/content";
import { SkillsMarquee } from "./skills-marquee";

type SkillsProps = {
  skills: Skill[];
};

type SkillGroup = {
  category: string;
  items: Skill[];
};

/**
 * Categories keep the order the data gives them (sort_order is already applied
 * by the repository), so a Studio edit moves a group without a code change.
 */
function groupSkills(skills: Skill[]): SkillGroup[] {
  const groups = new Map<string, Skill[]>();

  for (const skill of skills) {
    const items = groups.get(skill.category);

    if (items) items.push(skill);
    else groups.set(skill.category, [skill]);
  }

  return [...groups].map(([category, items]) => ({ category, items }));
}

/**
 * Skills (US-05). The readable lists are the content; a recruiter matches them
 * against a job description with no animation involved. The marquee is a
 * duplicate strip and never the only place a name appears.
 */
export function Skills({ skills }: SkillsProps) {
  const groups = groupSkills(skills);
  const names = groups.flatMap((group) => group.items.map((item) => item.name));

  return (
    <Section id="skills" eyebrow="Skills" title="Skills">
      {groups.length === 0 ? (
        <p className="text-fg-muted text-sm">Skills are being added.</p>
      ) : (
        <>
          <RevealRows selector="[data-reveal]" distance={18} duration={0.5} stagger={0.09}>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {groups.map((group) => (
                <div key={group.category} data-reveal>
                  <h3 className="text-fg-muted font-mono text-xs tracking-[0.2em] uppercase">
                    {group.category}
                  </h3>
                  <ul className="border-border mt-4 border-t">
                    {group.items.map((skill) => (
                      <li key={skill.id} className="border-border text-fg border-b py-2 text-sm">
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealRows>

          {names.length > 1 && <SkillsMarquee names={names} />}
        </>
      )}
    </Section>
  );
}
