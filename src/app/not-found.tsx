import type { Metadata } from "next";
import { ButtonLink, Heading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[var(--container-max)] px-6 py-24">
      <p className="text-fg-muted mb-4 font-mono text-xs tracking-[0.2em] uppercase">Error 404</p>
      <Heading level="h1">This page does not exist</Heading>
      <p className="text-fg-muted mt-4 max-w-2xl text-base">
        This page may have moved. Return to the homepage to browse the portfolio.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to the home page</ButtonLink>
      </div>
    </div>
  );
}
