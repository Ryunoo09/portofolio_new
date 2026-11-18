"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { CvDownloadLink } from "@/components/cv-download-link";
import { NAV_SECTIONS } from "@/lib/sections";
import { useActiveSection } from "../hooks/use-active-section";

const ids = NAV_SECTIONS.map((section) => section.id);

/** Desktop in-page navigation. Marks the section under the header, without animating layout. */
export function SectionNav() {
  const active = useActiveSection(ids);

  return (
    <div className="hidden items-center gap-6 md:flex">
      <nav aria-label="Sections">
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

      {/* Always on screen, so the CV is one click away from any scroll position (KPI-3). */}
      <CvDownloadLink className="px-3 py-1.5" />
    </div>
  );
}
