'use client';

import { useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { MOTION_CONTEXTS } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  /** Returns the URL for a 1-indexed frame. */
  frameSrc: (i: number) => string;
  frameCount: number;
  /** Shown before frames are ready, and used as the whole scene under reduced motion. */
  poster: string;
  /** Scroll distance the scrub occupies, as a ScrollTrigger `end` value. */
  end?: string;
  /** 0→1 scrub progress. Fires on desktop scrub and on the mobile timed fallback. */
  onProgress?: (progress: number) => void;
  /** HUD layer composited over the footage. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Scroll-scrubbed image sequence on canvas.
 *
 * Driving `video.currentTime` from scroll is the obvious approach and it fails:
 * browsers seek to the nearest keyframe so scrubbing stutters, and iOS Safari
 * will not seek reliably at all. Decoding to frames and painting them to a
 * canvas is the only approach that is actually smooth.
 *
 * Mobile never downloads the sequence — it gets the poster plus a timed run of
 * the same overlay, so the information is identical and the bytes are not.
 */
export default function ScrubSequence({
  frameSrc,
  frameCount,
  poster: posterSrc,
  end = '+=200%',
  onProgress,
  children,
  className = '',
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const current = useRef(-1);
  /** Last frame scroll asked for, painted or not. */
  const wanted = useRef(0);

  const paint = useCallback((index: number) => {
    wanted.current = index;
    const cv = canvas.current;
    const img = frames.current[index];
    // Not decoded yet. `wanted` is recorded above so the frame's own load
    // handler can paint it — otherwise a visitor who stops scrolling before
    // the sequence is ready stares at a stale frame forever.
    if (!cv || !img?.complete || img.naturalWidth === 0) return;
    if (current.current === index) return;
    current.current = index;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth * dpr;
    const h = cv.clientHeight * dpr;
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
    }

    // Cover-fit, centred.
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const load = () => {
        for (let i = 0; i < frameCount; i++) {
          const img = new Image();
          img.decoding = 'async';
          // Handler before `src` — a cached frame fires load on assignment.
          img.onload = () => {
            if (wanted.current === i) paint(i);
          };
          img.src = frameSrc(i + 1);
          frames.current[i] = img;
        }
      };

      // Desktop and tablet: pinned, scrubbed. The visitor drives the camera.
      mm.add(`${MOTION_CONTEXTS.isDesktop}, ${MOTION_CONTEXTS.isTablet}`, () => {
        // Start fetching a full viewport ahead so the sequence is ready by the
        // time the scrub begins.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom+=100%',
          once: true,
          onEnter: load,
        });

        const state = { frame: 0 };
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end,
          pin: '[data-pin]',
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            state.frame = Math.min(frameCount - 1, Math.round(self.progress * (frameCount - 1)));
            paint(state.frame);
            onProgress?.(self.progress);
          },
        });
      });

      // Mobile: no pin, no sequence download. Poster holds, overlay runs on a
      // timer so every fact still arrives.
      mm.add(MOTION_CONTEXTS.isMobile, () => {
        const p = { v: 0 };
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 70%',
          once: true,
          onEnter: () => {
            gsap.to(p, {
              v: 1,
              duration: 6,
              ease: 'none',
              onUpdate: () => onProgress?.(p.v),
            });
          },
        });
      });

      // Reduced motion: poster and final overlay state. Nothing moves.
      mm.add(MOTION_CONTEXTS.reduced, () => {
        onProgress?.(1);
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [frameCount] },
  );

  return (
    <div ref={root} className={`relative ${className}`}>
      <div data-pin className="relative h-screen w-full overflow-hidden bg-prussian">
        {/* The poster is the canvas's own background rather than an element
            layered over it. An unpainted canvas is transparent, so the poster
            shows through and the first drawn frame covers it — no load
            callbacks, no fade to coordinate, nothing to get out of sync. */}
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${posterSrc})` }}
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}
