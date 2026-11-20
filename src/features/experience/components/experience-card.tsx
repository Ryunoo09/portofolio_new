"use client";

import { DateRange } from "./date-range";
import { Tag } from "@/components/ui";
import type { Experience } from "@/types/content";

type ExperienceCardProps = {
  item: Experience;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
};

export function ExperienceCard({ item, isOpen, onToggle, index }: ExperienceCardProps) {
  const headingId = `exp-heading-${item.id}`;
  const bodyId = `exp-body-${item.id}`;

  return (
    <article
      data-exp-card
      data-index={index}
      className={`exp-card ${isOpen ? "is-active" : ""}`}
    >
      <button
        type="button"
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={onToggle}
        className="exp-card-header group"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-fg group-hover:text-accent text-base sm:text-lg font-medium tracking-tight transition-colors">
              {item.role}
            </h3>
            <span className="text-accent text-xs font-mono font-medium">
              {item.organization}
            </span>
          </div>
          <div className="text-fg-muted mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs">
            <DateRange startDate={item.start_date} endDate={item.end_date} />
            {item.location && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.location}</span>
              </>
            )}
          </div>
        </div>

        <div className="exp-indicator" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <div
        id={bodyId}
        role="region"
        aria-labelledby={headingId}
        className="exp-card-body-wrapper"
      >
        <div className="exp-card-body">
          {(item.bullets?.length ?? 0) > 0 && (
            <ul className="text-fg-muted border-border/60 border-t pt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {item.bullets.map((bullet, bIndex) => (
                <li key={`${item.id}-bullet-${bIndex}`}>{bullet}</li>
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
      </div>
    </article>
  );
}
