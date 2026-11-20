"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

/** Cheap on phones, still alive behind a projector. */
const MIN_DOTS = 28;
const MAX_DOTS = 80;
const AREA_PER_DOT = 18_000;
const MAX_DPR = 2;

/** 60 fps for smooth drifting motion. */
const FRAME_MS = 16;

type Dot = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
  accent: boolean;
  glow: boolean;
};

function randomDot(width: number, height: number): Dot {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.8 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.15 + Math.random() * 0.4),
    alpha: 0.18 + Math.random() * 0.42,
    phase: Math.random() * Math.PI * 2,
    accent: Math.random() < 0.7,
    glow: Math.random() < 0.2,
  };
}

/**
 * Ambient dust behind the whole page (US-08).
 *
 * One fixed canvas paints a few dozen 1-3 px dots at 30 fps. It sits at
 * `z-index: -1`, so it never covers text, never catches a click, and is hidden
 * from assistive tech. The loop stops while the tab is hidden and never starts
 * under reduced motion. No images, no dependency.
 */
export function DustLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    if (reducedMotion) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // The accent is a design token, never a second copy of the hex value.
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-soft")
        .trim() ||
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
    const neutral = "rgb(255 248 235)";

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let running = true;

    const draw = (now: number) => {
      if (!running) return;

      if (now - last >= FRAME_MS) {
        last = now;
        ctx.clearRect(0, 0, width, height);

        for (const dot of dots) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.phase += 0.01;

          if (dot.y < -4) {
            dot.y = height + 4;
            dot.x = Math.random() * width;
          }

          if (dot.x < -4) dot.x = width + 4;
          else if (dot.x > width + 4) dot.x = -4;

          if (dot.glow) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = accent || "rgb(235 201 110)";
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.globalAlpha = dot.alpha;
          ctx.fillStyle = dot.accent && accent ? accent : neutral;
          ctx.beginPath();
          // The wobble is applied when painting, so it never accumulates drift.
          ctx.arc(dot.x + Math.sin(dot.phase) * 0.8, dot.y, dot.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        MAX_DOTS,
        Math.max(MIN_DOTS, Math.round((width * height) / AREA_PER_DOT)),
      );

      // Keep the dots that already exist, so a resize does not make them jump.
      dots = Array.from({ length: count }, (_, index) => dots[index] ?? randomDot(width, height));
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-dust=""
      className="dust-layer"
    />
  );
}