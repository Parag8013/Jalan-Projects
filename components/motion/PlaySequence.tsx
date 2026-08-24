'use client';

import { useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { MOTION_CONTEXTS } from '@/lib/motion';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * How many frame requests may be in flight at once.
 *
 * This number is the difference between the coarse pass meaning something and
 * meaning nothing. Firing all 210 at once looks like it must be fastest, and
 * over HTTP/2 it is the opposite: the server round-robins every open stream, so
 * the last frame requested lands at roughly the same moment as the first, and
 * the careful coarse-to-fine ordering below buys exactly nothing.
 *
 * Measured against the deployed CDN: 210 in parallel took **3027 ms** before
 * the strip was covered. The 27-frame coarse pass, twelve at a time, took
 * **350 ms**. Same bytes, same order — the only difference is the constraint.
 */
const MAX_IN_FLIGHT = 12;

/**
 * How much of the strip must be decoded before playback may start, and how
 * long to wait for it before starting anyway.
 *
 * A scrub could begin on a half-loaded strip because the visitor set the pace —
 * they cannot outrun the loader by accident. Timed playback has no such brake:
 * it advances whether or not the next frame exists, and a sequence that starts
 * too early spends its first seconds snapping between whatever the coarse pass
 * happened to land. That is the single worst thing this scene can do, because
 * it happens exactly when the visitor is deciding whether the site is any good.
 *
 * So it waits — but never indefinitely. On a slow connection a scene that never
 * plays is worse than one that plays roughly, and `paint` already degrades to
 * the nearest decoded frame rather than freezing.
 */
const READY_FRACTION = 0.45;
const READY_TIMEOUT = 5;

/** Seconds for one pass when a scene does not ask for a specific length. */
const DEFAULT_DURATION = 16;

type Props = {
  /** Folder under /media/seq. Frames are `0001.jpg` upward. */
  seq: string;
  frameCount: number;
  /** Held under the canvas until frames arrive, and used whole under reduced motion. */
  poster: string;
  /** Full clip, for mobile — which plays the video rather than the strip. */
  video?: string;
  /** Seconds for one pass, first frame to last. */
  duration?: number;
  /** Seconds held on the first frame before it starts, so opening copy can be read. */
  hold?: number;
  /**
   * Keep the picture moving instead of resting on the last frame.
   *
   * A scene that plays once and stops is a scene that is dead for as long as
   * the visitor stays on it, and on a page where every other surface is moving
   * that reads as something having broken. The overlay is unaffected — it still
   * fills in once and holds — so this costs nothing in legibility.
   *
   * Not for the hero: a building that assembles itself on a loop is a building
   * that never actually got built. That scene hands over to the orbit clip
   * instead.
   */
  loop?: boolean;
  /**
   * A very slow push in across the scene, as a fraction of scale.
   *
   * `0.05` takes the picture from 1.0 to 1.05 over the whole run — about a
   * quarter of a percent per second, which nobody consciously notices and
   * everybody feels. It is the oldest trick in documentary editing and it is
   * here for a specific reason: generated footage moves at one constant rate
   * for its entire length, because that is what the prompt demanded of it, and
   * a shot with exactly one velocity in it reads as slightly inert however
   * good the picture is. A second, much slower move underneath gives the frame
   * somewhere to go.
   *
   * Applied to the canvas rather than the section, so the copy over it stays
   * put — type that drifts is type that is hard to read.
   */
  push?: number;
  /** 0→1 playback position. Drives every overlay in the scene. */
  onProgress?: (p: number) => void;
  /** 0→1 decode progress, for a loading readout. */
  onLoad?: (p: number) => void;
  /** Composited over the footage. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * A rendered frame sequence that plays itself.
 *
 * **This used to be scrubbed by scroll, and the change is the point.** Pinning
 * the section and mapping five viewports of wheel travel onto 210 frames meant
 * that for the entire first scene the page did not move when you scrolled it.
 * The scrub was smooth and the mapping was correct and it still read as the
 * page being broken — you push the wheel, the document refuses, and something
 * else moves instead. There is no tuning that fixes that, because the thing
 * being objected to is the mechanism working as designed.
 *
 * So nothing is pinned and nothing is intercepted now. The section is one
 * viewport tall, the page scrolls past it natively, and the film plays on its
 * own clock when it comes into view — the same contract as a video, which is
 * what a visitor already knows how to read. Scroll away mid-play and it pauses;
 * come back and it resumes where it stopped.
 *
 * Frames are decoded to images and painted to a canvas rather than driven
 * through `video.currentTime`. That was originally forced by scrubbing, and it
 * is still the right call: it is what makes the blend below possible, and the
 * strip is already cut, cached and paid for.
 */
export default function PlaySequence({
  seq,
  frameCount,
  poster,
  video,
  duration = DEFAULT_DURATION,
  hold = 0,
  loop = false,
  push = 0,
  onProgress,
  onLoad,
  children,
  className = '',
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  /** Last frame scroll asked for, painted or not. */
  const wanted = useRef(0);
  /** Pulls a single frame to the front of the load queue. Set once loading starts. */
  const demand = useRef<(i: number) => void>(() => {});

  const src = useCallback(
    (i: number) => media(`/media/seq/${seq}/${String(i + 1).padStart(4, '0')}.jpg`),
    [seq],
  );

  const decoded = (i: number) => {
    const img = frames.current[i];
    return !!img?.complete && img.naturalWidth > 0;
  };

  /**
   * Paint frame `index`, cross-faded `mix` of the way toward the one after it.
   *
   * The blend is what makes timed playback watchable. 210 frames over 16
   * seconds is 13 fps, and 13 fps of a slowly orbiting camera judders — the
   * strip was cut for scrubbing, where the visitor's own hand supplies the
   * smoothness, and it is too sparse to simply play. Drawing the next frame
   * over the current one at fractional opacity synthesises the frames in
   * between, so the picture moves at the display's refresh rate off a source
   * that only has 13 real ones per second.
   *
   * It is a cross-dissolve rather than true interpolation, so it reads as
   * motion blur, and on this footage that is a gift: every shot is a slow
   * constant-speed move, which is precisely the case where blending looks like
   * a long shutter and nothing like ghosting. It would fall apart on a whip pan.
   * Nothing here whip pans.
   */
  const paint = useCallback((index: number, mix: number) => {
    wanted.current = index;

    const cv = canvas.current;
    if (!cv) return;

    if (decoded(index)) {
      const next = index + 1;
      const blend = mix > 0.01 && next < frames.current.length && decoded(next);
      draw(cv, frames.current[index], blend ? frames.current[next] : null, mix);
      return;
    }

    /* Not decoded yet. Ask for it ahead of the queue, and meanwhile fall back
       to the nearest frame that is ready, so playback degrades to a lower frame
       rate rather than freezing on a stale picture. */
    if (!frames.current[index]) demand.current(index);

    for (let d = 1; d < 12; d++) {
      if (decoded(index - d)) return draw(cv, frames.current[index - d], null, 0);
      if (decoded(index + d)) return draw(cv, frames.current[index + d], null, 0);
    }
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* ---------------------------------------------------------------- */
      /* The strip                                                        */

      const started = new Uint8Array(frameCount);
      let inFlight = 0;
      let cursor = 0;
      let done = 0;
      let order: number[] = [];
      let onReady: (() => void) | null = null;

      const begin = (i: number) => {
        if (started[i]) return;
        started[i] = 1;
        inFlight++;

        const img = new Image();
        img.decoding = 'async';
        // Handler before `src`: a cached frame fires load on assignment.
        img.onload = img.onerror = () => {
          inFlight--;
          done++;
          onLoad?.(done / frameCount);
          if (wanted.current === i) paint(i, 0);
          if (onReady && done >= frameCount * READY_FRACTION) {
            onReady();
            onReady = null;
          }
          pump();
        };
        img.src = src(i);
        frames.current[i] = img;
      };

      const pump = () => {
        while (inFlight < MAX_IN_FLIGHT && cursor < order.length) {
          begin(order[cursor++]);
        }
      };

      const load = () => {
        if (frames.current.length) return;
        frames.current = new Array(frameCount);
        order = loadOrder(frameCount);
        /* Whatever the queue is working on, the frame actually on screen
           jumps it. Deliberately allowed past MAX_IN_FLIGHT: it is one
           request, and it is the only one the visitor can see. */
        demand.current = (i: number) => begin(i);
        pump();
      };

      /* ---------------------------------------------------------------- */
      /* Desktop and tablet: the strip, played on a clock                 */

      mm.add(`${MOTION_CONTEXTS.isDesktop}, ${MOTION_CONTEXTS.isTablet}`, () => {
        const clock = { p: 0 };

        /* The furthest the clock has ever reached, which is what the overlay
           is driven by — never the clock itself.

           This is the whole trick behind `loop`. The picture wants to keep
           moving forever; the words emphatically do not. A specification sheet
           that empties itself and refills every twelve seconds is a fidget, not
           a scene, and it makes a document that a buyer is trying to read
           impossible to finish. So the canvas follows the raw clock and the
           overlay follows its high-water mark: the film runs on, the copy fills
           in once and stays put. */
        let reached = 0;

        const film = gsap.to(clock, {
          p: 1,
          duration,
          delay: hold,
          ease: 'none',
          paused: true,
          repeat: loop ? -1 : 0,
          /* Yoyo rather than restart, for the same reason `pingpong()` exists
             in prepare-media.sh: these shots travel and never return to where
             they began, so looping them forward jump-cuts on every repeat. A
             camera that reverses on a slow move is far less noticeable. */
          yoyo: loop,
          onUpdate: () => {
            const t = clock.p * (frameCount - 1);
            const i = Math.min(frameCount - 1, Math.floor(t));
            paint(i, t - i);

            /* Written straight to style rather than through gsap.set: this
               runs on every tick, and it is one composited property. */
            if (push && canvas.current) {
              canvas.current.style.transform = `scale(${1 + push * clock.p})`;
            }

            if (clock.p > reached) {
              reached = clock.p;
              onProgress?.(reached);
            }
          },
        });

        /* Two gates, and it starts on the later of them: the section has to be
           on screen, and the strip has to be worth playing. */
        let inView = false;
        let ready = false;
        const resolve = () => {
          if (inView && ready) film.play();
          else film.pause();
        };

        onReady = () => {
          ready = true;
          resolve();
        };
        const failsafe = gsap.delayedCall(READY_TIMEOUT, () => {
          onReady = null;
          ready = true;
          resolve();
        });

        // Start fetching a full viewport early, so the strip is ready before
        // the scene arrives rather than during it.
        const warm = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom+=120%',
          once: true,
          onEnter: load,
        });

        const gate = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => {
            inView = self.isActive;
            resolve();
          },
        });

        const onResize = () => paint(wanted.current, 0);
        window.addEventListener('resize', onResize);

        return () => {
          failsafe.kill();
          film.kill();
          warm.kill();
          gate.kill();
          window.removeEventListener('resize', onResize);
        };
      });

      /* ---------------------------------------------------------------- */
      /* Mobile: the clip, on the same clock                              */

      mm.add(MOTION_CONTEXTS.isMobile, () => {
        const clock = { p: 0 };
        const el = () => root.current?.querySelector('video') ?? null;
        let reached = 0;

        const film = gsap.to(clock, {
          p: 1,
          duration,
          delay: hold,
          ease: 'none',
          paused: true,
          /* No yoyo here — a `<video>` cannot play backwards, so the element
             loops from its own first frame and the clock has to agree with it.
             The join is a cut rather than a reversal, which is why the looping
             clips are ping-ponged in the pipeline instead. */
          repeat: loop ? -1 : 0,
          onUpdate: () => {
            if (clock.p > reached) {
              reached = clock.p;
              onProgress?.(reached);
            }
          },
        });

        /* The clip is cut to its own length — 32 seconds for the assembly —
           and the overlay is written to `duration`. Playing both at their own
           speed is what used to leave the captions finished with two thirds of
           the film still to run. Rating the video to the clock keeps the words
           describing the picture they are over. */
        const sync = () => {
          const v = el();
          if (!v?.duration) return;
          v.playbackRate = gsap.utils.clamp(0.5, 4, v.duration / (duration + hold));
        };

        const gate = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 80%',
          end: 'bottom 20%',
          onToggle: (self) => {
            const v = el();
            if (self.isActive) {
              if (v && v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
              sync();
              v?.play().catch(() => {});
              film.play();
            } else {
              v?.pause();
              film.pause();
            }
          },
        });

        const v = el();
        v?.addEventListener('loadedmetadata', sync);

        return () => {
          v?.removeEventListener('loadedmetadata', sync);
          film.kill();
          gate.kill();
        };
      });

      /* Reduced motion: poster, and every overlay in its final state. */
      mm.add(MOTION_CONTEXTS.reduced, () => {
        onProgress?.(1);
        onLoad?.(1);
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [frameCount, seq, duration, hold, loop, push] },
  );

  return (
    <div ref={root} className={`relative ${className}`}>
      <div className="relative h-svh min-h-[560px] w-full overflow-hidden bg-void">
        {/* The poster is the canvas's own background rather than an element
            layered over it. An unpainted canvas is transparent, so the poster
            shows through and the first drawn frame covers it — no load
            callbacks, no fade to coordinate, nothing to get out of sync. */}
        <canvas
          ref={canvas}
          className="absolute inset-0 hidden h-full w-full bg-cover bg-center md:block"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />

        {/* Mobile carries the clip itself. `md:hidden` rather than a JS branch,
            so it is never even parsed as a candidate on desktop. */}
        {video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover md:hidden motion-reduce:hidden"
            poster={poster}
            muted
            loop={loop}
            playsInline
            preload="none"
            aria-hidden="true"
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : null}

        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block"
        />

        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Cover-fit, centred, at device pixel ratio — `b` cross-faded over `a`.
 *
 * Both frames are drawn through the same geometry, so the blend is a straight
 * dissolve between two identically framed pictures. Sizing the backing store
 * only when it has actually changed matters more than it looks: assigning to
 * `canvas.width` clears the canvas even when the value is identical, which on
 * every frame would show as a flicker.
 */
function draw(
  cv: HTMLCanvasElement,
  a: HTMLImageElement,
  b: HTMLImageElement | null,
  mix: number,
) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(cv.clientWidth * dpr);
  const h = Math.round(cv.clientHeight * dpr);
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }

  const cover = (img: HTMLImageElement) => {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  ctx.globalAlpha = 1;
  cover(a);

  if (b) {
    ctx.globalAlpha = mix;
    cover(b);
    ctx.globalAlpha = 1;
  }
}

/**
 * Frame request order: a coarse pass across the whole strip first, then the
 * gaps.
 *
 * Requesting 0,1,2,… in order means the last third of the scene is still
 * missing when playback reaches it, and `paint` falls back to a frame far
 * behind. A coarse-to-fine order means that after the first eighth of the
 * bytes the entire sequence is already covered at low frame rate, and every
 * subsequent frame just fills in.
 */
function loadOrder(n: number): number[] {
  const seen = new Uint8Array(n);
  const order: number[] = [];

  for (let step = 8; step >= 1; step >>= 1) {
    for (let i = 0; i < n; i += step) {
      if (!seen[i]) {
        seen[i] = 1;
        order.push(i);
      }
    }
  }
  for (let i = 0; i < n; i++) if (!seen[i]) order.push(i);

  return order;
}
