'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrubSequence from '@/components/motion/ScrubSequence';
import { FRAME_STAGES, SPAN_RANGE, EAVE_RANGE } from '@/content/buildToSuit';
import { EASE } from '@/lib/motion';

/**
 * Stage positions on a 0–100 timeline.
 *
 * Front-loaded rather than evenly spaced: the model finishes assembling around
 * 45% of the clip and then holds. Even spacing put "roof and wall cladding" on
 * screen while the footage still showed bare columns. Specs now track the
 * build, and the configurability beat gets the long static tail — which is
 * exactly where you want room to scrub the span and height.
 */
const AT = [0, 8, 18, 28, 38, 48, 62] as const;

/**
 * Scene 6 — Structure.
 *
 * Scroll raises the camera alongside an assembling portal frame, so scroll
 * direction *is* construction sequence. The graphics are a HUD in screen space
 * rather than an attempt to register dimension lines to the moving model —
 * tracking generated footage would look approximate, and a clean technical
 * readout reads as deliberate.
 */
export default function FrameAssembly() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const span = { v: SPAN_RANGE.min };
      const eave = { v: EAVE_RANGE.min };
      const write = (sel: string, text: string) => {
        const el = root.current?.querySelector(sel);
        if (el) el.textContent = text;
      };

      gsap.set('[data-spec]', { opacity: 0.25, x: 10 });
      gsap.set(['[data-dim="span"]', '[data-dim="eave"]'], { opacity: 0 });
      gsap.set('[data-dim="span"] [data-bar]', { scaleX: 0 });
      gsap.set('[data-dim="eave"] [data-bar]', { scaleY: 0 });

      const t = gsap.timeline({ paused: true });

      FRAME_STAGES.forEach((stage, i) => {
        t.to(`[data-spec="${stage.id}"]`, {
          opacity: 1,
          x: 0,
          duration: 6,
          ease: EASE.reveal,
        }, AT[i]);
        if (i > 0) {
          t.to(`[data-spec="${FRAME_STAGES[i - 1].id}"]`, {
            opacity: 0.25,
            duration: 6,
            ease: EASE.reveal,
          }, AT[i]);
        }
      });

      // Eave dimension arrives with the columns.
      t.to('[data-dim="eave"]', { opacity: 1, duration: 4 }, 10);
      t.to('[data-dim="eave"] [data-bar]', { scaleY: 1, duration: 10, ease: EASE.draw }, 10);

      // Span dimension arrives with the rafters.
      t.to('[data-dim="span"]', { opacity: 1, duration: 4 }, 22);
      t.to('[data-dim="span"] [data-bar]', { scaleX: 1, duration: 10, ease: EASE.draw }, 22);

      /* The configurability beat. Hold the finished frame and scrub both
         dimensions through their full range — "built to your spec", in one
         gesture rather than a sentence. */
      t.to(span, {
        v: SPAN_RANGE.max,
        duration: 30,
        ease: 'none',
        snap: { v: 1 },
        onUpdate: () => write('[data-fig="span"]', `${Math.round(span.v)} ${SPAN_RANGE.unit}`),
      }, AT[6]);
      t.to(eave, {
        v: EAVE_RANGE.max,
        duration: 30,
        ease: 'none',
        snap: { v: 1 },
        onUpdate: () => write('[data-fig="eave"]', `${Math.round(eave.v)} ${EAVE_RANGE.unit}`),
      }, AT[6]);
      t.to('[data-dim="span"] [data-bar]', { scaleX: 1.22, duration: 30, ease: 'none' }, AT[6]);
      t.to('[data-dim="eave"] [data-bar]', { scaleY: 1.2, duration: 30, ease: 'none' }, AT[6]);
      t.to('[data-beat]', { opacity: 1, y: 0, duration: 8, ease: EASE.reveal }, AT[6] + 4);

      tl.current = t;
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="frame-heading" className="relative z-10">
      <ScrubSequence
        frameSrc={(i) => `/frames/m5/${String(i).padStart(3, '0')}.jpg`}
        frameCount={192}
        poster="/media/m5-poster.jpg"
        end="+=250%"
        onProgress={(p) => tl.current?.progress(p)}
      >
        {/* Scrim. The footage is mid-tone, so type needs a ground to sit on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/55 to-ink/92"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/95 to-transparent"
        />

        {/* Absolute placement rather than a flex column: at 674px viewport
            heights a column stacks everything into the lower third. */}
        <div className="absolute inset-0 px-[var(--spacing-gutter)] py-[clamp(20px,4vh,48px)] text-white">
          <div className="relative mx-auto h-full max-w-[1440px]">
            {/* Title block — real data only, never decorative numbering. */}
            <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
              <h2 id="frame-heading" className="display text-[length:var(--text-display-l)]">
                Built to your specification
              </h2>
              <p className="label text-white/60">Section 06 · Build-to-suit · Portal frame</p>
            </header>

            {/* Eave height — vertical dimension, left edge, vertically centred. */}
            <div
              data-dim="eave"
              className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-3"
            >
              <div className="flex h-[min(34vh,240px)] flex-col items-center">
                <span className="h-px w-4 shrink-0 bg-white" />
                <span data-bar className="w-px flex-1 origin-bottom bg-white" />
                <span className="h-px w-4 shrink-0 bg-white" />
              </div>
              <div>
                <p className="label text-white/60">Eave height</p>
                <p
                  data-fig="eave"
                  className="numeral text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none text-white"
                >
                  {EAVE_RANGE.min} {EAVE_RANGE.unit}
                </p>
              </div>
            </div>

            {/* Spec panel — driven by GSAP, so the scrub costs zero re-renders. */}
            <ol className="absolute right-0 top-1/2 hidden w-[264px] -translate-y-1/2 flex-col gap-[min(2.2vh,16px)] border-l border-white/25 pl-5 md:flex">
              {FRAME_STAGES.map((stage) => (
                <li key={stage.id} data-spec={stage.id}>
                  <p className="label text-white/60">{stage.label}</p>
                  <p className="numeral text-[1.0625rem] leading-tight text-white">{stage.spec}</p>
                </li>
              ))}
            </ol>

            {/* Clear span — horizontal dimension, full width, pinned to the base. */}
            <div data-dim="span" className="absolute inset-x-0 bottom-0">
              <div className="flex items-center gap-3">
                <span className="h-4 w-px bg-white" />
                <span data-bar className="h-px flex-1 origin-left bg-white" />
                <span className="h-4 w-px bg-white" />
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                <p className="label text-white/60">Clear span — column-free floor</p>
                <p
                  data-fig="span"
                  className="numeral text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none text-white"
                >
                  {SPAN_RANGE.min} {SPAN_RANGE.unit}
                </p>
              </div>
              <p
                data-beat
                className="mt-2 hidden max-w-[46ch] translate-y-2 text-[0.9375rem] leading-snug text-white/60 opacity-0 lg:block"
              >
                Span and height are set by your operation — racking layout, handling equipment,
                vehicle access. Nothing here is a standard size.
              </p>
            </div>
          </div>
        </div>
      </ScrubSequence>
    </section>
  );
}
