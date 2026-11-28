"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { CvDownloadMenu } from "@/components/cv-download-menu";
import type { CvLinks } from "@/lib/cv";
import { NAV_SECTIONS } from "@/lib/sections";
import { NavIcon, type NavIconName } from "./nav-icons";

/** Mobile-only disclosure. Not a modal: no focus trap, Escape returns focus to the trigger. */
export function MobileMenu({ cv }: { cv: CvLinks }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useEffectEvent(() => {
    setOpen(false);
    triggerRef.current?.focus();
  });

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 48rem)").matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="nav-dock-mobile relative pointer-events-auto md:hidden">
      <div className="nav-dock">
        <nav aria-label="Sections">
          <ul className="nav-dock-list">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <Link
                  href={`/#${section.id}`}
                  onClick={(event) => {
                    const target = document.getElementById(section.id);
                    if (target) {
                      event.preventDefault();
                      target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  aria-label={section.label}
                  title={section.label}
                  className="nav-dock-item"
                >
                  <NavIcon name={section.icon as NavIconName} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close" : "Menu"}
          onClick={() => setOpen((value) => !value)}
          className="nav-dock-item text-fg"
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Sections"
        hidden={!open}
        className="mobile-nav-panel"
      >
        <ul className="flex flex-col gap-1">
          {NAV_SECTIONS.map((section, index) => (
            <li key={section.id}>
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                href={`/#${section.id}`}
                onClick={(event) => {
                  const target = document.getElementById(section.id);
                  if (target) {
                    event.preventDefault();
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                  setOpen(false);
                }}
                className="text-fg-muted hover:text-fg block py-2 text-sm"
              >
                {section.label}
              </Link>
            </li>
          ))}
          <li>
            <CvDownloadMenu
              cv={cv}
              variant="plain"
              className="py-2"
              onClick={() => setOpen(false)}
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}
