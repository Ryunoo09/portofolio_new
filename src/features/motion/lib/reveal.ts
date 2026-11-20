import { loadGsap } from "./load-gsap";

type RevealOptions = {
  /** Elements that animate in. */
  targets: HTMLElement[];
  /** Element whose top edge starts the tween. */
  trigger: Element;
  /** Starting offset in pixels; written with `transform` only. */
  distance: number;
  /** Seconds. */
  duration: number;
  /** Seconds between two targets. */
  stagger: number;
  /** Starting blur in pixels. Defaults to 0 (no blur). */
  blur?: number;
};

/**
 * Fades `targets` in once, when `trigger` reaches 85% of the viewport.
 *
 * Only targets still below the fold are hidden first, so the server HTML stays
 * visible until the effect takes over (a failed import can never blank the page).
 * The returned cleanup always removes the inline styles it wrote.
 */
export function revealOnScroll({ targets, trigger, distance, duration, stagger, blur = 0 }: RevealOptions) {
  const pending = targets.filter(
    (element) => element.getBoundingClientRect().top > window.innerHeight * 0.85,
  );

  if (pending.length === 0) return () => {};

  const restore = () => {
    for (const element of pending) {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("filter");
    }
  };

  let cleanup: (() => void) | undefined;
  let cancelled = false;

  void loadGsap()
    .then(({ gsap }) => {
      if (cancelled) return;

      // Hide only once GSAP is ready: a slow chunk then shows the rows as the
      // server rendered them instead of leaving them blank, and the tween always
      // has a starting state to animate from.
      for (const element of pending) {
        element.style.opacity = "0";
        element.style.transform = `translateY(${distance}px)`;
        if (blur > 0) {
          element.style.filter = `blur(${blur}px)`;
        }
      }

      const context = gsap.context(() => {
        gsap.to(pending, {
          opacity: 1,
          y: 0,
          filter: blur > 0 ? "blur(0px)" : undefined,
          duration,
          ease: "power2.out",
          stagger,
          clearProps: "opacity,transform,filter",
          scrollTrigger: { trigger, start: "top 85%", once: true },
        });
      }, trigger);

      cleanup = () => context.revert();
    })
    // A failed chunk load must never leave the rows hidden.
    .catch(restore);

  return () => {
    cancelled = true;
    cleanup?.();
    restore();
  };
}