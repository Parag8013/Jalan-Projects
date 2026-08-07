'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PARKS } from '@/content/site';
import { MOTION_CONTEXTS, formatNumber } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scene 5 — The three parks.
 *
 * Pinned and scrubbed sideways: vertical scroll drives horizontal travel, so
 * moving between parks is a physical gesture rather than a page jump. Counters
 * and rules run per panel as it arrives.
 *
 * Mobile drops the pin and stacks the panels — same figures, no sideways
 * hijacking of a small screen.
 */
export default function ParksHorizontal() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const runCounters = (panel: Element) => {
        panel.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          const o = { v: 0 };
          gsap.to(o, {
            v: target,
            duration: 1.1,
            ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: () => {
              el.textContent = formatNumber(o.v);
            },
          });
        });
        gsap.fromTo(
          panel.querySelectorAll('[data-row]'),
          { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.045, ease: 'power2.out' },
        );
        gsap.fromTo(
          panel.querySelector('[data-underline]'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'expo.out' },
        );
      };

      mm.add(MOTION_CONTEXTS.isDesktop, () => {
        const track = root.current!.querySelector<HTMLElement>('[data-track]')!;
        const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
        const distance = () => track.scrollWidth - window.innerWidth;
        // Scroll further than the track travels, so three data-dense panels get
        // a deliberate pace instead of flying past in under one viewport.
        const scrollLength = () => distance() * 1.7;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${scrollLength()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        panels.forEach((panel) => {
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: tween,
            start: 'left 72%',
            once: true,
            onEnter: () => runCounters(panel),
          });
        });

        gsap.to('[data-progress]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${scrollLength()}`,
            scrub: true,
          },
        });
      });

      // Tablet and mobile: stacked, each panel animates on its own entry.
      mm.add(`${MOTION_CONTEXTS.isTablet}, ${MOTION_CONTEXTS.isMobile}`, () => {
        gsap.utils.toArray<HTMLElement>('[data-panel]').forEach((panel) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 72%',
            once: true,
            onEnter: () => runCounters(panel),
          });
        });
      });

      mm.add(MOTION_CONTEXTS.reduced, () => {
        root.current?.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          el.textContent = formatNumber(Number(el.dataset.count));
        });
        gsap.set('[data-row]', { opacity: 1, x: 0 });
        gsap.set('[data-underline]', { scaleX: 1 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="parks"
      aria-labelledby="parks-heading"
      className="relative z-10 overflow-hidden bg-ink text-paper"
    >
      <div className="lg:h-svh lg:overflow-hidden">
        <div
          data-track
          className="flex flex-col lg:h-full lg:w-max lg:flex-row lg:items-stretch"
        >
          {/* Intro panel travels with the track. */}
          <div className="flex shrink-0 flex-col justify-center px-[var(--spacing-gutter)] py-[var(--spacing-section)] lg:w-[46vw] lg:py-0">
            <p className="label text-white/50">05 · Industrial parks · Howrah</p>
            <h2
              id="parks-heading"
              className="display mt-7 max-w-[12ch] text-[length:var(--text-display-l)]"
            >
              Three parks, <span className="accent-italic text-gold">ready now</span>
            </h2>
            <p className="mt-8 max-w-[44ch] text-[length:var(--text-lead)] text-white/70">
              Developed land inside our own parks — roads, power, water and drainage already in.
              Take a plot of any size and build, or have us build it for you.
            </p>
            <p className="label mt-10 hidden text-white/40 lg:block">Scroll to move sideways →</p>
          </div>

          {PARKS.map((park, i) => (
            <article
              key={park.slug}
              data-panel
              className="flex shrink-0 flex-col justify-center border-t border-white/12 px-[var(--spacing-gutter)] py-[var(--spacing-section)] lg:w-[42vw] lg:border-l lg:border-t-0 lg:py-0"
            >
              <p className="numeral text-[0.8125rem] text-gold">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="display mt-4 text-[length:var(--text-display-s)]">{park.name}</h3>
              <span
                data-underline
                className="mt-4 block h-px w-24 origin-left bg-gold"
                style={{ transform: 'scaleX(0)' }}
              />
              <p className="label mt-4 text-white/50">{park.place}</p>

              <div className="mt-9 flex items-end gap-9">
                <div>
                  <p className="label text-white/50">Available</p>
                  <p className="numeral mt-1 text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-gold">
                    <span data-count={park.availableAcres}>0</span>
                  </p>
                  <p className="label mt-1 text-white/50">acres</p>
                </div>
                <div className="pb-2">
                  <p className="label text-white/50">of total</p>
                  <p className="numeral mt-1 text-[1.25rem] leading-none text-white/80">
                    <span data-count={park.totalAcres}>0</span> acres
                  </p>
                </div>
              </div>

              <dl className="mt-9 max-w-[26rem] border-t border-white/12 pt-5">
                {[
                  ...park.connectivity.map((c) => [c.label, c.value] as const),
                  ['Power', park.power] as const,
                  ['Roads', park.roadWidth] as const,
                  ['Highway', park.highway] as const,
                ].map(([k, v]) => (
                  <div
                    key={k}
                    data-row
                    className="flex items-baseline justify-between gap-6 border-b border-white/8 py-2.5"
                  >
                    <dt className="label text-white/50">{k}</dt>
                    <dd className="numeral text-right text-[0.9375rem]">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 max-w-[30rem] text-[0.875rem] leading-relaxed text-white/65">
                {park.sectors.join(' · ')}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Horizontal progress. */}
      <div className="absolute inset-x-0 bottom-0 hidden h-px bg-white/15 lg:block">
        <span data-progress className="block h-full w-full origin-left scale-x-0 bg-gold" />
      </div>
    </section>
  );
}
