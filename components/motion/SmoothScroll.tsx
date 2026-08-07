'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns the single Lenis instance for the whole app and drives it from GSAP's
 * ticker, so smooth scroll and every ScrollTrigger share one clock. Two
 * separate rAF loops is the usual cause of scrub jitter.
 *
 * See docs/SCROLL-CHOREOGRAPHY.md § Technical spec.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Under reduced motion Lenis never initialises. Native scroll, final states.
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      // Native momentum on touch beats a synced emulation, and syncTouch is the
      // usual cause of janky mobile scroll on motion-heavy sites.
      syncTouch: false,
      autoRaf: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Dev-only handle. Native scrollTo bypasses Lenis, so ScrollTrigger never
    // updates — this makes exact scroll positions reachable when testing.
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pins compute their distance from element heights. If that happens before
    // the webfont swaps, every pin lands in the wrong place.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
