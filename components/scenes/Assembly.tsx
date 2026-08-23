'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ScrubSequence from '@/components/motion/ScrubSequence';
import { restPoints } from '@/lib/snap';
import { COMPANY, LEADERSHIP } from '@/content/site';
import { REFERENCE } from '@/content/buildToSuit';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Frames in `public/media/seq/build`. Must match what ffmpeg produced. */
export const BUILD_FRAMES = 210;

/* -------------------------------------------------------------------------- */

/**
 * Where each stage lands in the clip, as a fraction of its running time.
 *
 * ⚠ **These are tuned to the footage, not the other way round.** Generated
 * video will not hit a timing brief exactly, so after dropping in a new
 * sequence, scrub the hero in `npm run dev` — the frame counter in the bottom
 * right shows live progress — note where each stage actually arrives, and edit
 * `at` below. It is a two-minute job and it is the difference between captions
 * that describe the picture and captions that trail it.
 */
const BEATS = [
  {
    at: 0.0,
    name: 'Site',
    spec: 'Cleared · surveyed',
    note: 'Title verified, land use converted, records mutated. The ground is clear and in your name before anything stands on it.',
  },
  {
    at: 0.1,
    name: 'Foundation',
    spec: 'M25 pad footings',
    note: 'Isolated RCC pads, depth set by the bearing capacity measured at your site rather than by a standard detail.',
  },
  {
    at: 0.28,
    name: 'Columns',
    spec: `${REFERENCE.eave} m eave`,
    note: 'Built-up steel columns. Eave height comes from your racking and the reach of your handling equipment.',
  },
  {
    at: 0.38,
    name: 'Portal frame',
    spec: `${REFERENCE.span} m clear span`,
    note: 'Rafters close across the span. Between the two side walls, no column touches your floor.',
  },
  {
    at: 0.55,
    name: 'Cladding',
    spec: '0.5 mm PPGI',
    note: 'Insulated profile sheeting to roof and walls, with the dock openings set out to the vehicles that will use them.',
  },
  {
    at: 0.76,
    name: 'Glazing',
    spec: 'Curtain wall · clerestory',
    note: 'Office front, roof skylights and a clerestory band down the full length. Daylight on the floor without the heat gain.',
  },
  {
    at: 0.87,
    name: 'Handover',
    spec: 'Complete · operational',
    note: 'Floor, docks, power, drainage, apron and gatehouse. Handed over finished — not as a shell with a snag list attached.',
  },
] as const;

/** Where the assembly ends and the orbit loop takes the background. */
const HANDOFF = 0.93;

/**
 * Where a gesture is allowed to leave the visitor: on a stage, never between
 * two.
 *
 * A leading 0 keeps the top of the page — the hero, before the build starts —
 * a valid place to stand. The trailing 1 is the finished building with the
 * completion card up, the last stop before the pin releases.
 *
 * 0.05 clears the captions' 0.03 fade-in with a little to spare.
 */
const STOPS = [0, ...restPoints(BEATS.map((b) => b.at), 0.05), 1] as const;

/* -------------------------------------------------------------------------- */

/**
 * Scene 1 — the assembly.
 *
 * Scroll drives a rendered build sequence frame by frame: an empty plot, then
 * foundations, frame, cladding and glazing, until the building stands. When the
 * sequence finishes, a slow orbit of the finished building takes over the
 * background and loops, and the copy resolves on top of it.
 *
 * The scrub is a decoded image sequence on canvas, not a `<video>` — see
 * `components/motion/ScrubSequence.tsx` for why that is the only approach that
 * is actually smooth.
 */
export default function Assembly() {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const state = useRef({ p: 0, loopUp: -1 });

  useGSAP(
    () => {
      /* The overlay runs off a paused timeline that scroll scrubs, so a scene
         with seven cross-fading captions costs zero React re-renders. */
      const t = gsap.timeline({ paused: true });

      t.to('[data-hero]', { opacity: 0, y: -40, duration: 0.07, ease: 'power2.in' }, 0.03);
      t.set('[data-hero]', { pointerEvents: 'none' }, 0.1);
      t.to('[data-readout]', { opacity: 1, duration: 0.04 }, 0.06);

      BEATS.forEach((b, i) => {
        const next = BEATS[i + 1];
        t.to(
          `[data-beat="${i}"]`,
          { opacity: 1, y: 0, duration: 0.03, ease: 'power2.out' },
          b.at + 0.004,
        );
        if (next) {
          t.to(
            `[data-beat="${i}"]`,
            { opacity: 0, y: -18, duration: 0.026, ease: 'power2.in' },
            next.at - 0.02,
          );
        }
        t.to(`[data-tick="${i}"]`, { opacity: 1, duration: 0.02 }, b.at);
      });

      t.to('[data-rail]', { scaleX: 1, ease: 'none', duration: HANDOFF }, 0);
      t.to('[data-readout]', { opacity: 0, duration: 0.035 }, HANDOFF + 0.01);
      t.to(
        '[data-complete]',
        { opacity: 1, y: 0, duration: 0.055, ease: 'power2.out' },
        HANDOFF + 0.02,
      );

      /* Pin the timeline to exactly 1. Without this its duration is wherever
         the last tween happens to end, and `progress()` maps scroll onto a
         shorter span — every caption fires early. */
      t.set({}, {}, 1);
      tl.current = t;

      return () => {
        t.kill();
      };
    },
    { scope: root },
  );

  /** Called by the scrub on every update. */
  const onProgress = (p: number) => {
    state.current.p = p;
    tl.current?.progress(p);

    // The orbit loop comes up as the assembly lands, and the scrubbed canvas
    // stays underneath it — a hard swap would show a seam at the join.
    const v = loop.current;
    if (v) {
      const up = Math.max(0, Math.min(1, (p - HANDOFF) / (1 - HANDOFF - 0.02)));
      if (Math.abs(up - state.current.loopUp) > 0.004) {
        state.current.loopUp = up;
        v.style.opacity = String(up);
        if (up > 0.02 && v.paused) {
          if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
          v.play().catch(() => {});
        }
      }
    }

    if (readout.current) readout.current.textContent = `${Math.round(p * 100)}%`;
  };

  return (
    <section ref={root} id="top" className="relative z-10">
      <ScrubSequence
        seq="build"
        frameCount={BUILD_FRAMES}
        poster={media('/media/build-poster.jpg')}
        video={media('/media/build.mp4')}
        end="+=560%"
        snapAt={STOPS}
        onProgress={onProgress}
      >
        {/* The orbit loop. Sits over the scrubbed canvas and fades up as the
            building completes, so the scene keeps moving after the scrub has
            nothing left to do. */}
        <video
          ref={loop}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 will-change-[opacity] motion-reduce:hidden"
          poster={media('/media/orbit-poster.jpg')}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={media('/media/orbit.mp4')} type="video/mp4" />
        </video>

        <div className="vignette" aria-hidden="true" />

        {/* Title block. Present from the first frame, at fixed contrast.
            Fading it in with the readout left the opening hero copy sitting
            directly on the footage, and the footage behind this scene travels
            from an empty plot to a lit building — there is no single scrim
            value that a fade could arrive at late and still be right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[54%]"
          style={{
            background:
              'linear-gradient(to top, rgba(7,7,10,0.96) 0%, rgba(7,7,10,0.92) 22%, rgba(7,7,10,0.72) 46%, rgba(7,7,10,0.34) 70%, rgba(7,7,10,0.1) 87%, transparent 100%)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 px-[var(--spacing-gutter)] pb-[clamp(18px,3.5vh,40px)] pt-[92px]">
          <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end">
            {/* Hero — everything a first-time visitor needs before they move. */}
            <div data-hero className="will-change-[transform,opacity]">
              <p className="label text-gold">
                {COMPANY.base} · Established {COMPANY.founded}
              </p>
              <h1 className="display-xl mt-6 text-[length:var(--text-display-xl)] text-white">
                Land, <span className="accent-italic text-gold">anywhere</span>
                <br />
                in West Bengal.
              </h1>

              <div className="mt-[clamp(20px,3.5vh,44px)] flex flex-wrap items-end justify-between gap-x-14 gap-y-6">
                <p className="max-w-[46ch] text-[length:var(--text-lead)] text-mist">
                  Any size, in any district. Three industrial parks in Howrah, plus warehouses,
                  factory sheds and logistics facilities built to your specification — sourced,
                  titled, converted and handed over by one company.
                </p>
                <div className="pointer-events-auto flex flex-wrap gap-3">
                  <a
                    href="#enquiry"
                    className="bg-gold px-8 py-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-white"
                  >
                    Send enquiry
                  </a>
                  <a
                    href="#parks"
                    className="border border-white/25 px-8 py-4 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:border-white/70"
                  >
                    See available land
                  </a>
                </div>
              </div>

              <div className="mt-[clamp(18px,3vh,36px)] flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="label whitespace-nowrap text-ash">
                  {LEADERSHIP.ceo.name} · {LEADERSHIP.ceo.role}
                </span>
                <span className="hidden h-px flex-1 bg-white/12 sm:block" />
                <span className="label whitespace-nowrap text-gold">Scroll to build</span>
              </div>
            </div>

            {/* Stage readout — takes over from the hero once the build starts. */}
            <div
              data-readout
              className="absolute inset-x-0 bottom-[clamp(56px,9vh,102px)] opacity-0"
            >
              <div className="relative h-[clamp(158px,23vh,214px)]">
                {BEATS.map((s, i) => (
                  <div
                    key={s.name}
                    data-beat={i}
                    className="absolute inset-x-0 bottom-0 translate-y-5 opacity-0 will-change-[transform,opacity]"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                      <span className="numeral text-[0.8125rem] text-gold">
                        {String(i + 1).padStart(2, '0')} / {String(BEATS.length).padStart(2, '0')}
                      </span>
                      <span className="label text-ash">{s.spec}</span>
                    </div>
                    <h2 className="display mt-3 text-[length:var(--text-display-l)] text-white">
                      {s.name}
                    </h2>
                    <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-mist">
                      {s.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion card. */}
            <div
              data-complete
              className="absolute inset-x-0 bottom-[clamp(56px,9vh,102px)] translate-y-8 opacity-0 will-change-[transform,opacity]"
            >
              <p className="label text-gold">Handed over</p>
              <h2 className="display mt-4 max-w-[18ch] text-[length:var(--text-display-l)] text-white">
                One company, land to <span className="accent-italic text-gold">handover</span>.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-mist">
                Everything you just watched — the ground beneath it, the title behind it and the
                building on top of it — is one firm. Keep scrolling for what that involves.
              </p>
            </div>

            {/* Progress rail. Doubles as the chapter index for the whole build. */}
            <div className="mt-[clamp(16px,2.5vh,28px)]">
              <div className="relative h-px w-full bg-white/14">
                <span
                  data-rail
                  className="absolute inset-0 origin-left scale-x-0 bg-gold will-change-transform"
                />
              </div>
              <ul className="mt-3 hidden justify-between md:flex">
                {BEATS.map((s, i) => (
                  <li key={s.name} data-tick={i} className="label text-white/30 opacity-45">
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dev-only. This is how you tune the BEATS table to a new clip. */}
        {process.env.NODE_ENV === 'development' ? (
          <span
            ref={readout}
            className="numeral pointer-events-none absolute bottom-3 right-4 rounded-sm bg-black/60 px-2 py-1 text-[0.6875rem] text-gold"
          >
            0%
          </span>
        ) : null}
      </ScrubSequence>
    </section>
  );
}
