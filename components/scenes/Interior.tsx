'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PlaySequence from '@/components/motion/PlaySequence';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const INTERIOR_FRAMES = 192;

/**
 * ⚠ PLACEHOLDER FIGURES — see docs/VERIFY-BEFORE-LAUNCH.md.
 *
 * The handover set. Ordered the way you meet them walking the building: floor
 * underfoot, docks at the end, roof overhead, power at the wall.
 */
const HANDOVER = [
  {
    at: 0.16,
    key: 'Floor',
    value: '5 – 10 T/sqm',
    detail: 'Laser-screeded VDF, FM2 tolerance, joint-free bay construction.',
  },
  {
    at: 0.36,
    key: 'Docks',
    value: '6 – 12 T',
    detail: 'Hydraulic levellers, shelters, apron cut to your turning radius.',
  },
  {
    at: 0.56,
    key: 'Roof',
    value: '0.5 mm PPGI',
    detail: 'Insulated profile sheet, turbo ventilators, skylights to spec.',
  },
  {
    at: 0.74,
    key: 'Power',
    value: 'To sanction',
    detail: 'Dedicated transformer, LT panel and standby provision.',
  },
] as const;


/**
 * Scene 7 — handover.
 *
 * The camera moves down the centre of a finished, empty building. Four figures
 * arrive as you pass the thing each one describes, so the scene is a walkthrough
 * with a specification attached rather than a spec sheet with a video behind it.
 *
 * Empty is the point. A warehouse photographed full of someone else's pallets is
 * a photograph of someone else's business.
 */
export default function Interior() {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const t = gsap.timeline({ paused: true });

      t.to('[data-head]', { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.02);
      t.to('[data-head]', { opacity: 0, y: -24, duration: 0.05, ease: 'power2.in' }, 0.84);

      HANDOVER.forEach((h, i) => {
        const next = HANDOVER[i + 1];
        t.fromTo(
          `[data-card="${i}"]`,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.045, ease: 'power2.out' },
          h.at,
        );
        t.to(
          `[data-card="${i}"] [data-rule]`,
          { scaleX: 1, duration: 0.06, ease: 'power2.out' },
          h.at + 0.01,
        );
        if (next) {
          /* Clears before the next card arrives. These stack in one position,
             so any genuine overlap shows as two figures printed over each
             other — tolerable when a scrub made it fleeting, fixed and
             visible now that a clock sets the pace. There is room for the gap:
             the figures are 0.18 apart at the tightest. */
          t.to(
            `[data-card="${i}"]`,
            { opacity: 0, y: -22, duration: 0.035, ease: 'power2.in' },
            next.at - 0.05,
          );
        }
      });

      t.to(
        `[data-card="${HANDOVER.length - 1}"]`,
        { opacity: 0, y: -22, duration: 0.035, ease: 'power2.in' },
        0.86,
      );
      t.fromTo(
        '[data-final]',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' },
        0.9,
      );

      t.set({}, {}, 1);
      tl.current = t;

      return () => {
        t.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative z-10">
      {/* Ten seconds — four figures, paced to the time an unpinned section
          actually gets rather than to the length of the dolly. */}
      <PlaySequence
        seq="interior"
        frameCount={INTERIOR_FRAMES}
        poster={media('/media/interior-poster.jpg')}
        video={media('/media/interior.mp4')}
        duration={10}
        loop
        onProgress={(p) => tl.current?.progress(p)}
      >
        <div className="vignette" aria-hidden="true" />
        {/* The heading sits top-left over whatever the dolly happens to be
            passing, and in this footage that is a lit wall under a run of
            skylights — the brightest thing in the building. The scrim has to
            hold to roughly a third of the frame for the heading to survive it;
            anything shallower and the italic in gold goes first. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[52%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.9) 35%, rgba(7,7,10,0.55) 62%, transparent 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            background:
              'linear-gradient(to top, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.8) 32%, rgba(7,7,10,0.3) 64%, transparent 100%)',
          }}
        />

        <div className="absolute inset-0 px-[var(--spacing-gutter)] pb-[clamp(40px,8vh,88px)] pt-[100px]">
          <div className="relative mx-auto h-full w-full max-w-[1440px]">
            <div data-head className="translate-y-6 opacity-0">
              <p className="label text-gold">07 · Handover</p>
              <h2 className="display mt-5 max-w-[14ch] text-[length:var(--text-display-l)] text-white">
                Finished, not <span className="accent-italic text-gold">nearly</span>.
              </h2>
            </div>

            {/* One figure at a time, held low where the floor is darkest. */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="relative h-[clamp(150px,21vh,196px)]">
                {HANDOVER.map((h, i) => (
                  <div key={h.key} data-card={i} className="absolute inset-x-0 bottom-0 opacity-0">
                    <p className="label text-ash">{h.key}</p>
                    <p className="numeral mt-3 text-[clamp(2.25rem,5.5vw,4rem)] leading-none text-gold">
                      {h.value}
                    </p>
                    <span
                      data-rule
                      className="mt-5 block h-px w-full max-w-[420px] origin-left scale-x-0 bg-white/25"
                    />
                    <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-mist">
                      {h.detail}
                    </p>
                  </div>
                ))}

                <div data-final className="absolute inset-x-0 bottom-0 opacity-0">
                  <p className="label text-gold">Complete</p>
                  <p className="display mt-4 max-w-[24ch] text-[length:var(--text-display-s)] leading-snug text-white">
                    Floor, docks, power, drainage, apron and gatehouse — handed over ready to
                    operate, with the document set in your name.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PlaySequence>
    </section>
  );
}
