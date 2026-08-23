'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollTrigger setup. Nothing here touches the scroll position.
 *
 * This used to own a Lenis instance and a snapping engine that took each
 * gesture and drove the page to the next stage of the film. Both are gone. The
 * page scrolls natively now: a wheel notch moves the page by exactly what the
 * operating system says, immediately, and nothing intercepts it.
 *
 * The reason is worth keeping written down, because the snapping demoed well
 * and still had to go. Smoothing the *page* means the scroll position is no
 * longer the number the visitor asked for — every frame it is somewhere
 * between where they were and where they are going, and every pinned scene,
 * every scrub and every fixed element is recomputed against that moving
 * approximation. When it works it is invisible. When anything else on the
 * frame is expensive — and painting a 1200px JPEG to a canvas is expensive —
 * it stops tracking the input and reads as lag and stutter, which is exactly
 * the failure it was added to prevent.
 *
 * Smoothing the *film* instead costs nothing and cannot fail that way: the
 * page position stays honest and instantaneous, and only the canvas eases
 * toward it. That is what `SCRUB` in ScrubSequence now does.
 */
export default function ScrollRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    /* Mobile browsers change viewport height when their chrome hides and
       shows. Treating that as a resize re-measures every pin mid-scroll and
       the page visibly jumps. */
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* GSAP clamps large deltas after a stall to avoid animations jumping.
       Scrubbed timelines are driven by scroll position rather than elapsed
       time, so a clamp there just desynchronises them from the page. */
    gsap.ticker.lagSmoothing(0);

    /* Pins compute their distance from element heights. If that happens
       before the webfont swaps, every pin lands in the wrong place. */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
