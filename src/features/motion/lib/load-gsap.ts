import type { gsap as GsapInstance } from "gsap";
import type { ScrollTrigger as ScrollTriggerInstance } from "gsap/ScrollTrigger";

export type GsapBundle = {
  gsap: typeof GsapInstance;
  ScrollTrigger: typeof ScrollTriggerInstance;
};

let cached: Promise<GsapBundle> | null = null;

/**
 * Loads GSAP + ScrollTrigger on demand so they stay out of the initial bundle.
 * ponytail: module-level cache is enough; no context/provider needed.
 */
export function loadGsap(): Promise<GsapBundle> {
  cached ??= (async () => {
    const [gsapModule, scrollTriggerModule] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    const { gsap } = gsapModule;
    const { ScrollTrigger } = scrollTriggerModule;

    gsap.registerPlugin(ScrollTrigger);

    return { gsap, ScrollTrigger };
  })();

  return cached;
}
