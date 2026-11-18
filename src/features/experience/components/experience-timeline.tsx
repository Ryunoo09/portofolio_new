import { Section, Tag } from "@/components/ui";
import type { Experience } from "@/types/content";
import { DateRange } from "./date-range";

type ExperienceTimelineProps = {
  experiences: Experience[];
};

/**
 * Chronological timeline (US-03). Order comes from the data layer, newest start
 * date first. Rendered as a list so assistive tech announces how many roles there
 * are before reading them.
 * `bullets`/`tech` are read defensively: a hand-written database row can hold
 * null, and a bad row must not turn into a 500 page (R5).
 */
export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  return (
    <Section id="experience" eyebrow="Experience" title="Experience">
      {experiences.length === 0 ? (
        <p className="text-fg-muted text-sm">Experience is being updated.</p>
      ) : (
        <ol className="border-border border-t">
          {experiences.map((item) => (
            <li
              key={item.id}
              className="border-border grid gap-3 border-b py-8 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-8"
            >
              <p className="text-fg-muted font-mono text-xs tracking-wide">
                <DateRange startDate={item.start_date} endDate={item.end_date} />
                {item.location && <span className="block">{item.location}</span>}
              </p>

              <div>
                <h3 className="text-fg text-lg font-medium tracking-tight">{item.role}</h3>
                <p className="text-fg-muted mt-1 text-sm">{item.organization}</p>

                {(item.bullets?.length ?? 0) > 0 && (
                  <ul className="text-fg-muted mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                    {item.bullets.map((bullet, index) => (
                      <li key={`${item.id}-b${index}`}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {(item.tech?.length ?? 0) > 0 && (
                  <ul
                    aria-label={`Technologies for ${item.role}`}
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {item.tech.map((tech) => (
                      <Tag key={`${item.id}-${tech}`}>{tech}</Tag>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
