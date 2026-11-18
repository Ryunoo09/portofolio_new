"use client";

import { useEffect } from "react";
import { Button, Heading } from "@/components/ui";

/**
 * Route-level error boundary. A content failure must never leave a bare 5xx
 * screen (PRD R5), so the page offers a retry instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-6 py-24">
      <p className="text-fg-muted mb-4 font-mono text-xs tracking-[0.2em] uppercase">
        Something broke
      </p>
      <Heading level="h1">This page could not be loaded</Heading>
      <p className="text-fg-muted mt-4 max-w-2xl text-base">
        Try again. If it keeps failing, the site is still reachable from the home page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
