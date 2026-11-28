"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

type ProjectGalleryProps = {
  images: GalleryImage[];
  title: string;
};

/**
 * Screenshot thumbnails for a case study. Thumbnails use `object-contain` so no
 * part of a screenshot is cropped; clicking one opens a native `<dialog>` (modal
 * semantics, Escape handling and focus trap come from the platform).
 *
 * `src` is resolved on the server: `mediaUrl()` reads `process.env` dynamically,
 * which Next cannot inline into the client bundle.
 */
export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;
    if (active && !dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
    if (!active && dialog.open) dialog.close();
  }, [active]);

  if (images.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-surface/40 p-6 backdrop-blur-xs">
      <h2 className="text-fg font-mono text-xs font-semibold tracking-[0.2em] uppercase">
        Gallery
      </h2>

      <ul className="mt-4 grid grid-cols-2 gap-2.5">
        {images.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActive(item)}
              aria-label={`Open image: ${item.alt}`}
              className="group border-border bg-bg relative block aspect-[2/1] w-full overflow-hidden rounded-lg border transition-colors hover:border-border-strong focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 64rem) 12rem, 45vw"
                className="object-contain p-1 transition-transform duration-200 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${title} gallery`}
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActive(null);
        }}
        className="bg-surface/95 m-auto max-h-[92vh] max-w-[92vw] rounded-xl border border-border p-2 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {active && (
          <div className="relative">
            <div className="relative aspect-[2/1] w-[min(88vw,68rem)]">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setActive(null)}
              aria-label="Close image"
              className="bg-bg/80 absolute top-2 right-2 backdrop-blur-sm"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
        )}
      </dialog>
    </div>
  );
}