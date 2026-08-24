'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollTrigger setup. Nothing here touches the scroll position.
 *
 * This used to own a Lenis instance and a snapping engine that took each
 * gesture and drove the page to the next stage of the film. Both are gone, and
 * so, now, is the scrubbing they existed to serve. The page scrolls natively: a
 * wheel notch moves the page by exactly what the operating system says,
 * immediately, and nothing intercepts it.
 *
 * The reason is worth keeping written down, because each of these demoed well
 * and each still had to go. Smoothing the *page* means the scroll position is
 * no longer the number the visitor asked for — every frame it is somewhere
 * between where they were and where they are going, and every pinned scene and
 * fixed element is recomputed against that moving approximation. When it works
 * it is invisible. When anything else on the frame is expensive — and painting
 * a 1200px JPEG to a canvas is expensive — it stops tracking the input and
 * reads as lag, which is exactly the failure it was added to prevent.
 *
 * Pinning failed the same test one level up. Even with the scroll position
 * honest and the film smooth, a scene that holds the document still for five
 * viewports while it plays is a scene where scrolling does not scroll. That is
 * not a tuning problem and it had no fix short of removal, so the film now
 * plays on a clock instead — see `components/motion/PlaySequence.tsx`.
 *
 * **One pin survives, in `ParksHorizontal`, and the distinction is the whole
 * lesson.** There, vertical scroll is spent travelling sideways through the
 * three parks: the gesture still moves the thing the visitor is looking at, in
 * proportion, under their control. What was removed is the case where scroll
 * bought no movement at all — where the page went rigid and a film played at
 * its own pace regardless. Pinning was never the fault; spending the visitor's
 * scroll on something that was going to happen anyway was.
 */
export default function ScrollRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    /* Mobile browsers change viewport height when their chrome hides and
       shows. Treating that as a resize re-measures every pin mid-scroll and
       the page visibly jumps. */
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* Lag smoothing back on, and it has to be.
     *
     * This used to be `lagSmoothing(0)`, which was right when every timeline
     * was driven by scroll position: a scrubbed tween takes its value from the
     * scrollbar, not from elapsed time, so clamping the tick delta only
     * desynchronised it from the page.
     *
     * Nothing is scrubbed now. The films run on a clock, and with clamping off
     * the clock is raw wall time — so any stall hands the tween the entire gap
     * at once and it jumps. Switching tabs is the case that bites: the browser
     * suspends rAF, and on return GSAP is told twenty seconds elapsed and
     * advances the hero from wherever it was to its final frame in a single
     * tick. The visitor comes back to a film that has silently ended.
     *
     * These are GSAP's own defaults: a tick longer than 500ms is treated as
     * 33ms, so a stall costs the animation a frame rather than the whole scene.
     */
    gsap.ticker.lagSmoothing(500, 33);

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
