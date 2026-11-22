import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "@/styles/globals.css";
import { DockShell, MobileMenu, SectionNav } from "@/features/navigation";
import { DustLayer } from "@/features/motion";
import { MusicPlayer, musicConfig } from "@/features/music-player";
import { Preloader } from "@/features/preloader";
import { getSiteSettings } from "@/data";
import { cvLinks } from "@/lib/cv";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const cv = cvLinks(settings);
  const music = musicConfig(settings);

  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <Preloader />
        <DustLayer />

        <a
          href="#main"
          className="bg-accent text-accent-fg rounded-md px-4 py-2 text-sm font-medium sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-nav)]"
        >
          Skip to content
        </a>

        <DockShell>
          <SectionNav cv={cv} />
          <MobileMenu cv={cv} />
        </DockShell>

        <main id="main">{children}</main>

        <footer className="border-border border-t">
          <div className="text-fg-muted mx-auto w-full max-w-[var(--container-max)] px-6 pt-8 pb-24 text-center text-sm sm:pb-8">
            © {new Date().getFullYear()} {SITE_NAME}
            {music && (
              <p className="mt-2">
                Music: {music.map((track, index) => (
                  <span key={track.src}>
                    {index > 0 && "; "}
                    {track.creditUrl ? (
                      <a href={track.creditUrl} target="_blank" rel="noreferrer noopener" className="hover:text-fg underline underline-offset-2">
                        {track.title}{track.credit && ` — ${track.credit}`}
                      </a>
                    ) : (
                      <>{track.title}{track.credit && ` — ${track.credit}`}</>
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>
        </footer>

        {music && <MusicPlayer tracks={music} />}
      </body>
    </html>
  );
}
