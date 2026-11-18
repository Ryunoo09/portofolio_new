"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS } from "@/lib/sections";
import { useActiveSection } from "../hooks/use-active-section";

const ids = NAV_SECTIONS.map((section) => section.id);

/** Desktop in-page navigation. Marks the section under the header, without animating layout. */
export function SectionNav() {
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Sections" className="hidden md:block">
      <ul className="flex items-center gap-6">
        {NAV_SECTIONS.map((section) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              aria-current={active === section.id ? "true" : undefined}
              className={cn(
                "text-sm transition-colors duration-[var(--duration-fast)]",
                active === section.id ? "text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
