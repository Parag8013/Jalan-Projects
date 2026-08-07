'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { MOTION_CONTEXTS, EASE } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scene 1 — Opening.
 *
 * Light register: the footage sits under a warm cream wash so the page opens
 * bright rather than cinematic-dark. Gold appears exactly twice — one italic
 * word and the primary action.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        `${MOTION_CONTEXTS.isDesktop}, ${MOTION_CONTEXTS.isTablet}, ${MOTION_CONTEXTS.isMobile}`,
        () => {
          gsap
            .timeline({ delay: 0.15 })
            .to('[data-video]', { opacity: 1, duration: 1.4, ease: EASE.reveal })
            .from('[data-rule]', { scaleX: 0, duration: 0.9, ease: EASE.draw }, 0.3)
            .from(
              '[data-line]',
              { opacity: 0, y: 28, duration: 0.8, stagger: 0.08, ease: EASE.reveal },
              0.45,
            );

          gsap.to('[data-video]', {
            scale: 1.07,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 },
          });
          gsap.to('[data-copy]', {
            y: -60,
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: 1 },
          });
        },
      );

      mm.add(MOTION_CONTEXTS.reduced, () => {
        gsap.set('[data-video]', { opacity: 1 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative z-10 h-svh min-h-[620px] overflow-hidden bg-paper">
      <video
        data-video
        className="absolute inset-0 h-full w-full object-cover opacity-0 motion-reduce:hidden"
        src="/media/m1-opening.mp4"
        poster="/media/m1-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <img
        src="/media/m1-poster.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block"
      />

      {/* Warm white wash — keeps the page bright and the type readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-paper/92 via-paper/55 to-paper/95"
      />

      {/* Top padding clears the fixed header, which now carries the wordmark
          and location — the hero repeating them was a duplicate. */}
      <div className="absolute inset-0 flex flex-col justify-end gap-[clamp(28px,6vh,72px)] px-[var(--spacing-gutter)] pb-[clamp(20px,4vh,44px)] pt-[92px]">
        <div data-copy className="mx-auto w-full max-w-[1440px]">
          <h1 data-line className="display-xl text-[length:var(--text-display-xl)]">
            Land, <span className="accent-italic">anywhere</span>
            <br />
            in West Bengal.
          </h1>

          <div className="mt-[clamp(24px,4vh,48px)] flex flex-wrap items-end justify-between gap-x-14 gap-y-7">
            <p data-line className="max-w-[44ch] text-[length:var(--text-lead)] text-grey">
              Any size, in any district. Three industrial parks in Howrah, plus warehouses,
              factory sheds and logistics facilities built to your specification.
            </p>
            <div data-line className="flex flex-wrap gap-3">
              <a
                href="#enquiry"
                className="bg-gold px-8 py-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
              >
                Send enquiry
              </a>
              <a
                href="#parks"
                className="border border-ink/20 px-8 py-4 text-[0.9375rem] font-medium text-ink transition-colors duration-200 hover:border-ink/60"
              >
                See available land
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex items-center gap-5">
            <span data-line className="label whitespace-nowrap text-grey">
              Owned industrial parks
            </span>
            <span data-rule className="h-px flex-1 origin-left bg-line" />
            <span data-line className="numeral whitespace-nowrap text-[1.0625rem] text-gold-deep">
              03 · Howrah
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
