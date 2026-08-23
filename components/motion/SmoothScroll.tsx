'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { nearestStep, nextStep, settlePoints, stepGroupsAt } from '@/lib/snap';

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/* Snap tuning                                                                 */

/**
 * Frames per second a committed step aims to play at.
 *
 * Duration is derived from this, not fixed. The stages of the hero are spaced
 * to the footage rather than evenly, so a fixed duration gave one step 44
 * frames and the next 10 — a fourfold swing in smoothness between one gesture
 * and the next, which is precisely the unevenness that reads as unpolished.
 * Holding the rate and varying the duration trades a difference nobody can see
 * for one everybody can.
 */
const STEP_FPS = 44;
/** Floor and ceiling on that. Short steps must not feel abrupt, long ones must
    not feel like waiting. */
const STEP_MIN = 0.38;
const STEP_MAX = 1.05;
/** For groups that are not film — the horizontal parks — there are no frames to
    pace to, so distance stands in. Roughly a viewport per second. */
const STEP_PX_PER_SECOND = 900;
/** Pause after arriving before another gesture can commit. Stops one long
    wheel spin from firing four steps back to back. */
const STEP_COOLDOWN = 90;
/** How far above a scene the committed region starts claiming gestures, as a
    fraction of the viewport. Without this the first stage is already behind
    the visitor by the time the group takes over. */
const STEP_LEAD = 0.35;

/** Stillness before an alignment nudge is considered. */
const SETTLE_IDLE = 170;
/** How close to a section top the visitor must already be, as a fraction of
    the viewport. Deliberately short: this aligns, it does not transport. */
const SETTLE_REACH = 0.12;
/** Below this it is not worth moving at all. */
const SETTLE_MIN = 6;

/** Fast to settle, and used for the short corrective nudges. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Eased at both ends, and used for every committed step.
 *
 * A step commits on the first scroll event of a gesture, when the page has
 * barely begun to move. An ease-out starts at its maximum velocity, so against
 * that near-standstill it reads as a yank — the single most unpolished moment
 * in the whole sequence. Easing in as well costs a few frames at the start and
 * removes it.
 */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Seconds a step should take to cross `distance` within `group`. */
function stepDuration(group: { from: number; to: number; frameSpan?: number }, distance: number) {
  const span = Math.abs(group.to - group.from);
  const seconds =
    group.frameSpan && span > 0
      ? (Math.abs(distance) / span) * group.frameSpan / STEP_FPS
      : Math.abs(distance) / STEP_PX_PER_SECOND;
  return Math.min(STEP_MAX, Math.max(STEP_MIN, seconds));
}

/* -------------------------------------------------------------------------- */

/**
 * Owns the single Lenis instance for the whole app and drives it from GSAP's
 * ticker, so smooth scroll and every ScrollTrigger share one clock. Two
 * separate rAF loops is the usual cause of scrub jitter.
 *
 * It also owns snapping. That lives here rather than in ScrollTrigger's own
 * `snap` option for one reason: ScrollTrigger snaps by animating the window's
 * scroll position, which Lenis then treats as an external interference and
 * drags back toward its own internal target. The two fight, visibly. Driving
 * every snap through `lenis.scrollTo` means there is only ever one thing
 * moving the page.
 *
 * See docs/SCROLL-CHOREOGRAPHY.md § Snapping.
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

    /* ---------------------------------------------------------------- */
    /* Snapping                                                          */

    // Touch keeps its native momentum, and below the tablet breakpoint the
    // scenes are not pinned at all, so there is nothing to step through.
    const fine = window.matchMedia('(min-width: 768px) and (pointer: fine)');

    /** True while a snap is in flight. Nothing else may start one. */
    let snapping = false;
    let cooldownUntil = 0;
    let settleTimer: number | undefined;

    const settle = () => {
      if (snapping || !fine.matches) return;

      const y = window.scrollY;

      /* Inside a scene, this is the safety net under the step logic. A step
         commits, arrives, and holds a short cooldown — and any wheel still in
         flight during that cooldown moves the page a few pixels off the stage
         with no gesture left to commit the next one. Landing 16px past a
         composed frame is exactly the kind of not-quite that the whole
         mechanism exists to remove.

         Bounded strictly to the scene's own range rather than its lead-in: a
         visitor leaving upward is briefly still inside the lead zone, and
         re-aligning there would pull them back into a scene they have just
         decided to leave. */
      const inside = stepGroupsAt(y, 0);
      if (inside.length) {
        const stage = nearestStep(inside[0], y);
        if (Math.abs(stage - y) < SETTLE_MIN) return;

        snapping = true;
        lenis.scrollTo(stage, {
          duration: 0.35,
          easing: easeOutCubic,
          onComplete: () => {
            snapping = false;
          },
        });
        return;
      }

      // Approaching or leaving a scene: leave it to the step logic.
      if (stepGroupsAt(y, window.innerHeight * STEP_LEAD).length) return;

      const reach = window.innerHeight * SETTLE_REACH;
      let best: number | null = null;
      let bestDistance = Infinity;

      for (const p of settlePoints()) {
        const d = Math.abs(p - y);
        if (d < bestDistance) {
          bestDistance = d;
          best = p;
        }
      }

      if (best === null || bestDistance > reach || bestDistance < SETTLE_MIN) return;

      snapping = true;
      lenis.scrollTo(best, {
        duration: 0.5,
        easing: easeOutCubic,
        onComplete: () => {
          snapping = false;
        },
      });
    };

    const onScroll = () => {
      ScrollTrigger.update();

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_IDLE);

      if (snapping || !fine.matches || Date.now() < cooldownUntil) return;

      const direction = lenis.direction;
      if (direction !== 1 && direction !== -1) return;

      const y = window.scrollY;

      let target: number | null = null;
      let duration = STEP_MIN;
      for (const group of stepGroupsAt(y, window.innerHeight * STEP_LEAD)) {
        target = nextStep(group, y, direction);
        if (target !== null) {
          duration = stepDuration(group, target - y);
          break;
        }
      }

      // Nothing ahead in any group covering this position: the visitor is at
      // the edge of a scene and on their way out of it. Let them go.
      if (target === null) return;

      snapping = true;
      lenis.scrollTo(target, {
        duration,
        easing: easeInOutCubic,
        // The whole point: once a gesture has committed to a stage, further
        // input does not divert it. Without this a trackpad's tail end
        // interrupts the step halfway and leaves the caption mid-fade.
        lock: true,
        onComplete: () => {
          snapping = false;
          cooldownUntil = Date.now() + STEP_COOLDOWN;
        },
      });
    };

    lenis.on('scroll', onScroll);

    /* ---------------------------------------------------------------- */

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
      window.clearTimeout(settleTimer);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
