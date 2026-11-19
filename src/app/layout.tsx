import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "@/styles/globals.css";
import { MobileMenu, SectionNav } from "@/features/navigation";
import { Preloader } from "@/features/preloader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";

// Header/footer read content too, so the layout revalidates with the pages.
export const revalidate = 300;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <Preloader />

        <a
          href="#main"
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-medium sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-nav)]"
        >
          Skip to content
        </a>

        <header className="border-border sticky top-0 z-[var(--z-nav)] h-[var(--header-height)] border-b bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
          <div className="mx-auto flex h-full w-full max-w-[var(--container-max)] items-center justify-between gap-4 px-6">
            <a href="#home" className="text-fg text-sm font-medium tracking-tight">
              {SITE_NAME}
            </a>
            <SectionNav />
            <MobileMenu />
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="border-border border-t">
          <div className="text-fg-muted mx-auto w-full max-w-[var(--container-max)] px-6 py-8 text-sm">
            © {new Date().getFullYear()} {SITE_NAME}
          </div>
        </footer>
      </body>
    </html>
  );
}
