'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import RevealText from '@/components/motion/RevealText';
import { CAPABILITIES } from '@/content/site';
import { MOTION_CONTEXTS } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scene 2 — What we do.
 *
 * Was six cards in a grid that faded up once. Now each capability is a full
 * panel that sticks, then recedes under the next as it arrives — so the scroll
 * itself deals the six lines out one at a time and the section has a rhythm
 * instead of a single reveal.
 */
export default function CapabilityStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_CONTEXTS.isDesktop}, ${MOTION_CONTEXTS.isTablet}`, () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]');

        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          const trigger = {
            trigger: cards[i + 1],
            start: 'top 85%',
            end: 'top 30%',
            scrub: true,
          } as const;

          // Scale the card, but fade only its contents. Fading the card itself
          // makes it translucent and the card underneath shows straight
          // through the stack.
          gsap.to(card, { scale: 0.94, ease: 'none', scrollTrigger: trigger });
          gsap.to(card.querySelector('[data-card-inner]'), {
            opacity: 0.28,
            filter: 'blur(1.5px)',
            ease: 'none',
            scrollTrigger: trigger,
          });
        });

        // Progress rail alongside the stack.
        gsap.to('[data-rail]', {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 80%', scrub: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="capabilities"
      className="grain relative z-10 bg-carbon px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-[clamp(40px,6vw,80px)] flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
          <RevealText as="h2" className="display max-w-[15ch] text-[length:var(--text-display-l)]">
            Six ways we get you <span className="accent-italic">land</span>
          </RevealText>
          <p className="label text-gold">03 · What we do</p>
        </div>

        <RevealText
          as="p"
          split="words"
          className="mb-[clamp(48px,7vw,96px)] max-w-[56ch] text-[length:var(--text-lead)] text-mist"
        >
          Half of what we do is find land — not list it, find it. Verify the title, convert the
          use, mutate the records, and hand it over clear. The rest is building on it.
        </RevealText>

        <div className="relative grid gap-6 lg:grid-cols-[40px_1fr]">
          {/* Progress rail — fills as the stack is dealt out. */}
          <div className="relative hidden lg:block">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-edge" />
            <span
              data-rail
              className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 scale-y-0 bg-gold"
            />
          </div>

          <ol>
            {CAPABILITIES.map((c, i) => (
              <li
                key={c.title}
                data-card
                className="sticky top-[124px] mb-6 origin-top border border-edge bg-slate p-[clamp(24px,3.5vw,56px)] transition-colors duration-300 hover:border-gold/45"
              >
                <div data-card-inner>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                    <span className="numeral text-[0.8125rem] text-gold">
                      {String(i + 1).padStart(2, '0')} /{' '}
                      {String(CAPABILITIES.length).padStart(2, '0')}
                    </span>
                    <span className="label text-ash">{c.lead}</span>
                  </div>

                  <div className="mt-6 grid gap-x-12 gap-y-5 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                    <h3 className="display text-[length:var(--text-display-l)] leading-[1.02]">
                      {c.title}
                    </h3>
                    <div>
                      <p className="numeral text-[1.5rem] leading-none text-gold">{c.figure}</p>
                      <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-mist">
                        {c.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
