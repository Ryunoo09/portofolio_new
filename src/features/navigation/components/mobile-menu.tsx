"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { CvDownloadMenu } from "@/components/cv-download-menu";
import type { CvLinks } from "@/lib/cv";
import { NAV_SECTIONS } from "@/lib/sections";

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
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="text-fg border-border rounded-sm border px-3 py-1.5 text-sm"
      >
        {open ? "Close" : "Menu"}
      </button>

      <nav
        id="mobile-menu"
        aria-label="Sections"
        hidden={!open}
        className="border-border bg-bg absolute inset-x-0 top-full border-b"
      >
        <ul className="mx-auto flex max-w-[var(--container-max)] flex-col gap-1 px-6 py-4">
          {NAV_SECTIONS.map((section, index) => (
            <li key={section.id}>
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
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
