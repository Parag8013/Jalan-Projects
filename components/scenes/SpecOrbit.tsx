'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ScrubSequence from '@/components/motion/ScrubSequence';
import { restPoints } from '@/lib/snap';
import { EAVE_RANGE, FRAME_STAGES, SPAN_RANGE } from '@/content/buildToSuit';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const ORBIT_FRAMES = 210;

/**
 * One stop per row of the specification sheet, matching the timings the rows
 * fade in on below — 0.12 plus an even share of the middle 0.66 — plus the
 * held final frame. Change one and change the other, or a gesture lands
 * between two rows.
 */
const STOPS = [
  0,
  ...restPoints(
    FRAME_STAGES.map((_, i) => 0.12 + (0.66 * i) / FRAME_STAGES.length),
    // The row's bar is the slowest thing to arrive, at 0.05.
    0.065,
  ),
  1,
] as const;

/**
 * Scene 6 — the specification.
 *
 * A single unbroken orbit of the finished building, scrubbed. Seven
 * specifications resolve one at a time as the camera comes round, so the figure
 * on screen is always describing the part of the building you are looking at.
 *
 * The clip is deliberately one continuous move with nothing happening in it.
 * This is where a buyer who is actually evaluating stops and reads, and a scene
 * that keeps changing under the numbers is a scene nobody finishes reading.
 */
export default function SpecOrbit() {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const t = gsap.timeline({ paused: true });

      // Head and sheet arrive first, then the rows light in turn.
      t.to('[data-head]', { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.02);
      t.to('[data-sheet]', { opacity: 1, duration: 0.05 }, 0.08);

      // The rows occupy the middle of the orbit; the last stretch holds so the
      // finished building gets a beat with nothing written over it.
      const first = 0.12;
      const window = 0.66;

      FRAME_STAGES.forEach((stage, i) => {
        const at = first + (window * i) / FRAME_STAGES.length;
        t.to(
          `[data-row="${i}"]`,
          { opacity: 1, x: 0, duration: 0.035, ease: 'power2.out' },
          at,
        );
        t.to(
          `[data-row="${i}"] [data-bar]`,
          { scaleX: 1, duration: 0.05, ease: 'power2.out' },
          at,
        );
        // Dim the previous row rather than removing it: the sheet should read
        // as a document filling in, not as a slideshow.
        if (i > 0) {
          t.to(`[data-row="${i - 1}"]`, { opacity: 0.42, duration: 0.04 }, at);
        }
      });

      t.to(
        `[data-row="${FRAME_STAGES.length - 1}"]`,
        { opacity: 0.42, duration: 0.04 },
        first + window,
      );
      t.to('[data-close]', { opacity: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0.84);

      t.set({}, {}, 1);
      tl.current = t;

      return () => {
        t.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="build" className="relative z-10">
      <ScrubSequence
        seq="orbit"
        frameCount={ORBIT_FRAMES}
        poster={media('/media/orbit-poster.jpg')}
        video={media('/media/orbit.mp4')}
        end="+=340%"
        snapAt={STOPS}
        onProgress={(p) => tl.current?.progress(p)}
      >
        <div className="vignette" aria-hidden="true" />

        {/* Copy runs down both edges with the building between them, so the
            scrim has to be built the same way: a flat base that knocks the
            whole frame back, then a reinforced column under each block of
            type. A single right-weighted gradient left the heading and the two
            dimension figures sitting on bare cladding. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[rgba(7,7,10,0.52)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(7,7,10,0.88) 0%, rgba(7,7,10,0.6) 22%, transparent 46%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to left, rgba(7,7,10,0.92) 0%, rgba(7,7,10,0.74) 24%, transparent 52%)',
          }}
        />

        <div className="absolute inset-0 px-[var(--spacing-gutter)] py-[clamp(76px,10vh,112px)]">
          <div className="mx-auto grid h-full max-w-[1440px] grid-rows-[auto_1fr] gap-8 lg:grid-cols-[1fr_minmax(360px,42%)] lg:grid-rows-1 lg:items-center lg:gap-16">
            <div data-head className="translate-y-6 opacity-0 self-start lg:self-center">
              <p className="label text-gold">06 · Build-to-suit · Portal frame</p>
              <h2 className="display mt-6 max-w-[13ch] text-[length:var(--text-display-l)] text-white">
                Built to your <span className="accent-italic text-gold">specification</span>
              </h2>
              <p className="mt-6 max-w-[42ch] text-[length:var(--text-lead)] leading-relaxed text-mist">
                Nothing here is a standard size. Span and eave height come from your racking, your
                handling equipment and the vehicles that will use the docks.
              </p>

              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
                <div>
                  <dt className="label text-ash">Clear span</dt>
                  <dd className="numeral mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-none text-gold">
                    {SPAN_RANGE.min}–{SPAN_RANGE.max} {SPAN_RANGE.unit}
                  </dd>
                </div>
                <div>
                  <dt className="label text-ash">Eave height</dt>
                  <dd className="numeral mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-none text-gold">
                    {EAVE_RANGE.min}–{EAVE_RANGE.max} {EAVE_RANGE.unit}
                  </dd>
                </div>
              </dl>

              <p
                data-close
                className="mt-10 max-w-[40ch] translate-y-4 text-[0.9375rem] leading-relaxed text-ash opacity-0"
              >
                Every figure opposite is set at the brief stage, before a drawing is issued — not
                chosen from a standard range after the fact.
              </p>
            </div>

            {/* The sheet. */}
            <dl data-sheet className="self-center opacity-0">
              {FRAME_STAGES.map((stage, i) => (
                <div
                  key={stage.id}
                  data-row={i}
                  className="translate-x-6 border-b border-white/12 py-[clamp(8px,1.4vh,16px)] opacity-0"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="display text-[length:var(--text-title)] leading-tight text-white">
                      {stage.label}
                    </dt>
                    <dd className="numeral shrink-0 text-[1.0625rem] text-gold">{stage.spec}</dd>
                  </div>
                  <span
                    data-bar
                    className="mt-2 block h-px w-full origin-left scale-x-0 bg-gold/45"
                  />
                  {/* Seven rows plus seven descriptions do not fit a laptop
                      viewport, and the sheet is centred — so the overflow
                      silently cropped the first row off the top. The detail
                      line is the part that can go. */}
                  <p className="mt-2.5 hidden max-w-[46ch] text-[0.875rem] leading-relaxed text-ash [@media(min-height:900px)]:block">
                    {stage.detail}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </ScrubSequence>
    </section>
  );
}
