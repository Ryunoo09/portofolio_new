"use client";

import { useSyncExternalStore } from "react";
import { buttonClassName } from "@/components/ui";

type EmailLinkProps = {
  /** Character codes, so the address never travels as plain text. */
  codes: number[];
};

/** Hydration flag: the `mailto:` is only built in the browser. */
const subscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * US-06: the address is assembled on the client, so the server-rendered HTML
 * (and the flight payload) carries numbers instead of a scrapeable `mailto:`.
 * It is a real link once hydrated: keyboard and screen readers reach it like
 * any other anchor. `contact.tsx` adds a `<noscript>` fallback for no-JS.
 */
export function EmailLink({ codes }: EmailLinkProps) {
  const hydrated = useHydrated();
  const address = hydrated ? String.fromCharCode(...codes) : null;

  return (
    <a href={address ? `mailto:${address}` : undefined} className={buttonClassName("primary")}>
      Email me
      <span className="sr-only"> (opens your email app)</span>
    </a>
  );
}
