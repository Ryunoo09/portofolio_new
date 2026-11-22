"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { CvDownloadMenu } from "@/components/cv-download-menu";
import type { CvLinks } from "@/lib/cv";
import { NAV_SECTIONS } from "@/lib/sections";
import { NavIcon, type NavIconName } from "./nav-icons";
import { useActiveSection } from "../hooks/use-active-section";

const ids = NAV_SECTIONS.map((section) => section.id);

/** Desktop in-page navigation. Floating icon dock with sliding active indicator. */
export function SectionNav({ cv }: { cv: CvLinks }) {
  const active = useActiveSection(ids);
  const activeIndex = NAV_SECTIONS.findIndex((section) => section.id === active);

  return (
    <nav aria-label="Sections" className="nav-dock hidden md:flex">
      <ul className="nav-dock-list">
        {NAV_SECTIONS.map((section) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              aria-current={active === section.id ? "true" : undefined}
              aria-label={section.label}
              title={section.label}
              className="nav-dock-item"
            >
              <NavIcon name={section.icon as NavIconName} />
            </Link>
          </li>
        ))}
        <li>
          <CvDownloadMenu cv={cv} variant="icon" />
        </li>
      </ul>

      <span
        aria-hidden="true"
        className="nav-dock-indicator"
        data-index={activeIndex === -1 ? 0 : activeIndex}
        style={{ "--nav-index": activeIndex === -1 ? 0 : activeIndex } as CSSProperties}
      />
    </nav>
  );
}
