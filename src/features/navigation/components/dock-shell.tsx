"use client";

import type { ReactNode } from "react";
import { useHideOnScroll } from "../hooks/use-hide-on-scroll";

export function DockShell({ children }: { children: ReactNode }) {
  const hidden = useHideOnScroll();

  return (
    <header className="nav-dock-shell" data-hidden={hidden ? "true" : undefined}>
      {children}
    </header>
  );
}
