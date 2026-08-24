'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PlaySequence from '@/components/motion/PlaySequence';
import { COMPANY, LEADERSHIP } from '@/content/site';
import { REFERENCE } from '@/content/buildToSuit';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Frames in `public/media/seq/build`. Must match what ffmpeg produced. */
export const BUILD_FRAMES = 192;

/* -------------------------------------------------------------------------- */

/**
 * How long the hero holds before it starts, and how long it then runs.
 *
 * `HOLD` is the whole reason the opening headline still works now that the
 * film plays itself. Under the old scrub the hero copy sat there until the
 * visitor chose to move; on a clock it would begin dissolving half a second
 * after the page painted, which is not enough time to read the one sentence
 * that says what this company does.
 *
 * `RUN` is a compromise with an honest cost. Nothing is pinned any more, so
 * the visitor can leave at any moment and most will leave before the end —
 * every second added here is a second of film fewer people see. Twenty is
 * about the longest that still lets the seven stages land at a readable pace;
 * the captions below are written short for exactly this reason.
 */
const HOLD = 2.5;
const RUN = 18;

/**
 * A slow push in across the whole scene, 1.0 to 1.05.
 *
 * The generated clip travels at exactly one speed from its first frame to its
 * last, because that is what it was asked for, and a shot with a single
 * velocity in it reads as slightly flat however good the picture is. A second,
 * far slower move underneath fixes that for nothing. Quarter of a percent per
 * second: invisible if you look for it, felt if you do not.
 */
const PUSH = 0.05;

/**
 * Where each stage lands in the clip, as a fraction of its running time.
 *
 * ⚠ **These are tuned to the footage, not the other way round.** Generated
 * video will not hit a timing brief exactly, so after dropping in a new
 * sequence, watch the hero in `npm run dev` — the frame counter in the bottom
 * right shows live progress — note where each stage actually arrives, and edit
 * `at` below. It is a two-minute job and it is the difference between captions
 * that describe the picture and captions that trail it.
 *
 * ⚠ **Keep `note` to one short line.** These used to be read at whatever pace
 * the visitor scrolled, so length cost nothing. They are now on a timer, and
 * the tightest gap in the table below is about two seconds. A note that cannot
 * be read in its slot is not a shorter note, it is no note.
 *
 * ⚠ **There are five stages here, not seven, and that is the footage's doing.**
 * The clip shows three states: bare footings for its first fifth, the building
 * arriving across the next fifth, and the finished thing for the rest. Columns,
 * rafters, cladding and glazing never appear as separate events, so captions
 * naming them had nothing underneath — the old seven-stage table was describing
 * a film that was never generated. `Structure` sits on the arrival, and
 * `Envelope` and `Handover` describe the finished building, which is honest:
 * both are readable in the picture they sit on.
 */
const BEATS = [
  {
    at: 0.0,
    name: 'Site',
    spec: 'Cleared · surveyed',
    note: 'Title verified, land use converted, records in your name.',
  },
  {
    at: 0.11,
    name: 'Foundation',
    spec: 'M25 pad footings',
    note: 'Isolated RCC pads, depth set by your soil, not by a standard detail.',
  },
  {
    at: 0.26,
    name: 'Structure',
    spec: `${REFERENCE.span} m clear span`,
    note: 'Portal frame closes the span. No column touches your floor.',
  },
  {
    at: 0.45,
    name: 'Envelope',
    spec: '0.5 mm PPGI',
    note: 'Insulated profile sheet, dock openings set to your vehicles.',
  },
  {
    at: 0.64,
    name: 'Handover',
    spec: 'Complete · operational',
    note: 'Floor, docks, power, drainage, apron. Finished, not a shell.',
  },
] as const;

/** Where the assembly ends and the orbit loop takes the background. */
const HANDOFF = 0.88;


/* -------------------------------------------------------------------------- */

/**
 * Scene 1 — the assembly.
 *
 * A rendered build sequence plays itself: an empty plot, then foundations,
 * frame, cladding and glazing, until the building stands. When the sequence
 * finishes, a slow orbit of the finished building takes over the background and
 * loops, and the copy resolves on top of it.
 *
 * **The scene is no longer pinned and no longer scrubbed.** It used to hold the
 * page still for five and a half viewports of wheel travel and spend them
 * turning frames instead, and that read to a visitor as the page being stuck —
 * the objection was to the mechanism, not to its tuning, so the mechanism went.
 * See `components/motion/PlaySequence.tsx`.
 *
 * What that costs, and it is worth being clear about it: the film is no longer
 * guaranteed an audience. Anyone can scroll past at any moment, so the stages
 * are timed tight and the completion card carries the same two calls to action
 * as the hero — whichever end of the scene a visitor is looking at, there is
 * something to press.
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

      /* Each caption clears before the next one arrives, and the four
         thousandths between them are not slack — they are the point.

         These used to overlap by about a twentieth of the timeline. Under a
         scrub that was invisible, because the overlap was only ever as long as
         the visitor's own scroll made it and they were usually moving. On a
         clock it is a fixed second of two headlines stacked in the same
         position, both legible, and it reads as a rendering fault rather than
         as a transition. The fades are short for the same reason: at the
         tightest gap in BEATS a stage gets 1.8 seconds in total, and a
         half-second fade at each end would leave under a second of it actually
         readable. */
      const FADE = 0.018;

      BEATS.forEach((b, i) => {
        const next = BEATS[i + 1];
        t.to(
          `[data-beat="${i}"]`,
          { opacity: 1, y: 0, duration: FADE, ease: 'power2.out' },
          b.at,
        );
        if (next) {
          t.to(
            `[data-beat="${i}"]`,
            { opacity: 0, y: -18, duration: FADE, ease: 'power2.in' },
            next.at - FADE - 0.004,
          );
        }
        t.to(`[data-tick="${i}"]`, { opacity: 1, duration: 0.02 }, b.at);
      });

      t.to('[data-rail]', { scaleX: 1, ease: 'none', duration: HANDOFF }, 0);

      /* Same rule at the handover as between the beats: the stage readout is
         gone before the completion card starts, or the last caption and the
         closing headline share the corner. */
      t.to('[data-readout]', { opacity: 0, duration: 0.025 }, HANDOFF);
      t.to(
        '[data-complete]',
        { opacity: 1, y: 0, duration: 0.035, ease: 'power2.out' },
        HANDOFF + 0.03,
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
        /* Match the canvas's push, or the crossfade is also a 5% jump in the
           size of the building — the two layers are briefly superimposed and
           any scale difference between them reads as a snap. */
        v.style.transform = `scale(${1 + PUSH * p})`;
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
      <PlaySequence
        seq="build"
        frameCount={BUILD_FRAMES}
        poster={media('/media/build-poster.jpg')}
        video={media('/media/build.mp4')}
        duration={RUN}
        hold={HOLD}
        push={PUSH}
        onProgress={onProgress}
      >
        {/* The orbit loop. Sits over the canvas and fades up as the building
            completes, so the scene keeps moving after the sequence has nothing
            left to do — which now matters more than it did, because the film
            reaches its last frame on its own and then simply sits there. */}
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
                {/* Not "Scroll to build" any more — the film runs on its own
                    clock, so that was instructing the visitor to do something
                    that does nothing. */}
                <span className="label whitespace-nowrap text-gold">Watch it build</span>
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

            {/* Completion card.

                This is where the hero comes to rest, and unlike the scrubbed
                version it can be rested on: the film ends by itself, so a
                visitor who watched it through is left sitting here with the
                headline and both buttons already faded out above. Repeating
                the calls to action is not duplication, it is the only reason
                this end state is still a usable page. */}
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
              <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
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
      </PlaySequence>
    </section>
  );
}
