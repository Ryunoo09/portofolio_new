"use client";

import type { ReactNode } from "react";
import { useHideOnScroll } from "../hooks/use-hide-on-scroll";

export function DockShell({ children }: { children: ReactNode }) {
  const { hidden, scrolled } = useHideOnScroll();

  return (
    <header
      className="nav-dock-shell"
      data-hidden={hidden ? "true" : undefined}
      data-scrolled={scrolled ? "true" : undefined}
    >
      {children}
    </header>
  );
}
