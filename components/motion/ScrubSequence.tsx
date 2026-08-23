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
 * Scrub smoothing, in seconds.
 *
 * With smooth scrolling gone this is the only easing left in the chain, and it
 * is applied in the right place. A mouse wheel notch moves the page ~100px
 * instantly, which at this sequence's density is five frames at once; without
 * smoothing the film would step rather than move.
 *
 * The distinction that matters: this eases the *picture* toward the scroll
 * position, it does not ease the scroll position itself. The page still lands
 * exactly where the visitor put it, on the frame they put it there — only the
 * canvas takes a moment to catch up, and nothing about pinning or layout
 * depends on it. That is why it cannot produce the lag a smooth-scroll library
 * can.
 */
const SCRUB = 0.4;

type Props = {
  /** Folder under /media/seq. Frames are `0001.jpg` upward. */
  seq: string;
  frameCount: number;
  /** Held under the canvas until frames arrive, and used whole under reduced motion. */
  poster: string;
  /** Full clip, for mobile — which plays rather than scrubs. */
  video?: string;
  /** Scroll distance the scrub occupies, as a ScrollTrigger `end`. */
  end?: string;
  /** 0→1. Fires on the desktop scrub and on the mobile timed run. */
  onProgress?: (p: number) => void;
  /** 0→1 decode progress, for a loading readout. */
  onLoad?: (p: number) => void;
  /** Composited over the footage. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Scroll-scrubbed image sequence on canvas.
 *
 * Driving `video.currentTime` from scroll is the obvious approach and it fails:
 * browsers seek to the nearest keyframe so scrubbing stutters, and iOS Safari
 * will not seek reliably at all. Encoding all-intra fixes the seeking and
 * triples the file. Decoding to frames and painting to a canvas is the only
 * approach that is smooth everywhere, and it is what every polished
 * scroll-video site actually ships.
 *
 * Mobile never downloads the sequence. It gets the clip, played once on entry,
 * with the same overlay run on a timer — identical information, a fraction of
 * the bytes, and no pinning on a small screen.
 */
export default function ScrubSequence({
  seq,
  frameCount,
  poster,
  video,
  end = '+=300%',
  onProgress,
  onLoad,
  children,
  className = '',
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  /** Last frame actually painted. */
  const painted = useRef(-1);
  /** Last frame scroll asked for, painted or not. */
  const wanted = useRef(0);
  /** Pulls a single frame to the front of the load queue. Set once loading starts. */
  const demand = useRef<(i: number) => void>(() => {});

  const src = useCallback(
    (i: number) => media(`/media/seq/${seq}/${String(i + 1).padStart(4, '0')}.jpg`),
    [seq],
  );

  const paint = useCallback((index: number) => {
    wanted.current = index;

    const cv = canvas.current;
    const img = frames.current[index];
    if (!cv) return;

    /* Not decoded yet. `wanted` is recorded above so the frame's own load
       handler can paint it when it lands — otherwise a visitor who stops
       scrolling before the sequence is ready stares at a stale frame forever. */
    if (!img?.complete || img.naturalWidth === 0) {
      // Not even requested yet — ask for it ahead of the queue.
      if (!img) demand.current(index);

      // Fall back to the nearest decoded frame so the scrub degrades to a
      // lower frame rate rather than freezing.
      let near = -1;
      for (let d = 1; d < 12; d++) {
        const a = frames.current[index - d];
        if (a?.complete && a.naturalWidth) {
          near = index - d;
          break;
        }
        const b = frames.current[index + d];
        if (b?.complete && b.naturalWidth) {
          near = index + d;
          break;
        }
      }
      if (near < 0 || painted.current === near) return;
      drawTo(cv, frames.current[near]);
      painted.current = near;
      return;
    }

    if (painted.current === index) return;
    painted.current = index;
    drawTo(cv, img);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* Decode the whole strip coarse-to-fine, never more than
         MAX_IN_FLIGHT at a time. The window is what makes the ordering real —
         see the note on the constant. */
      const started = new Uint8Array(frameCount);
      let inFlight = 0;
      let cursor = 0;
      let done = 0;
      let order: number[] = [];

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
          if (wanted.current === i) paint(i);
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

      // Desktop and tablet: pinned and scrubbed. The visitor drives the camera.
      mm.add(`${MOTION_CONTEXTS.isDesktop}, ${MOTION_CONTEXTS.isTablet}`, () => {
        // Start fetching a full viewport early, so the strip is ready before
        // the scrub begins rather than during it.
        const warm = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom+=120%',
          once: true,
          onEnter: load,
        });

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end,
          pin: '[data-pin]',
          anticipatePin: 1,
          scrub: SCRUB,
          onUpdate: (self) => {
            paint(Math.min(frameCount - 1, Math.round(self.progress * (frameCount - 1))));
            onProgress?.(self.progress);
          },
        });


        const onResize = () => {
          painted.current = -1;
          paint(wanted.current);
        };
        window.addEventListener('resize', onResize);

        return () => {
          warm.kill();
          st.kill();
          window.removeEventListener('resize', onResize);
        };
      });

      // Mobile: no pin, no strip. The clip plays once and the overlay runs on a
      // timer, so every fact still arrives.
      mm.add(MOTION_CONTEXTS.isMobile, () => {
        const p = { v: 0 };
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 65%',
          once: true,
          onEnter: () => {
            const v = root.current?.querySelector('video');
            v?.play().catch(() => {});
            gsap.to(p, {
              v: 1,
              duration: 7,
              ease: 'none',
              onUpdate: () => onProgress?.(p.v),
            });
          },
        });
        return () => st.kill();
      });

      // Reduced motion: poster, and every overlay in its final state.
      mm.add(MOTION_CONTEXTS.reduced, () => {
        onProgress?.(1);
        onLoad?.(1);
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [frameCount, seq] },
  );

  return (
    <div ref={root} className={`relative ${className}`}>
      <div data-pin className="relative h-svh min-h-[560px] w-full overflow-hidden bg-void">
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
            loop
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

/** Cover-fit, centred, at device pixel ratio. */
function drawTo(cv: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(cv.clientWidth * dpr);
  const h = Math.round(cv.clientHeight * dpr);
  if (cv.width !== w || cv.height !== h) {
    cv.width = w;
    cv.height = h;
  }

  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/**
 * Frame request order: a coarse pass across the whole strip first, then the
 * gaps.
 *
 * Requesting 0,1,2,… in order means the last third of the scene is still
 * missing when a fast scroller reaches it, and `paint` falls back to a frame
 * far behind. A coarse-to-fine order means that after the first eighth of the
 * bytes the entire scrub is already covered at low frame rate, and every
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
