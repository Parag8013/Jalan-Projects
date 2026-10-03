'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import RevealText from '@/components/motion/RevealText';
import { COMPANY, LEADERSHIP } from '@/content/site';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const initials = LEADERSHIP.ceo.name
  .split(' ')
  .map((part) => part[0])
  .join('');

/**
 * Scene 11 — leadership.
 *
 * Portrait of Mr Jalan, supplied by the company (public/media/
 * brij-mohan-jalan.jpg), with his initials set as a small plate hanging off its
 * lower corner. The plate is the old nameplate kept on, so the block still
 * carries the site's drafting language rather than being a bare photo.
 *
 * Nothing here is attributed to him as a quotation. The principles are the
 * company's own words — see content/site.ts for why.
 */
export default function Leadership() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-portrait]',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      );

      gsap.fromTo(
        '[data-mark]',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          delay: 0.35,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      );

      gsap.fromTo(
        '[data-mark-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          delay: 0.25,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      );

      gsap.fromTo(
        '[data-principle]',
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-principles]', start: 'top 80%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="leadership"
      className="grain relative z-10 bg-carbon px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-x-16 gap-y-[clamp(48px,7vw,88px)] lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* --- Nameplate --------------------------------------------------- */}
          <div>
            <p className="label text-gold">10 · Leadership</p>

            <div className="relative mt-9 max-w-[420px]">
              <div data-portrait className="overflow-hidden border border-gold/30 opacity-0">
                <img
                  src="/media/brij-mohan-jalan.jpg"
                  alt={LEADERSHIP.ceo.name}
                  width={1070}
                  height={1281}
                  loading="lazy"
                  className="block h-auto w-full select-none"
                  draggable={false}
                />
              </div>

              {/* Hangs below the photo rather than past its side, so it never
                  pushes into the page gutter on a phone. */}
              <div
                data-mark
                className="absolute -bottom-9 right-6 flex h-[88px] w-[88px] items-center justify-center border border-gold/45 bg-carbon opacity-0"
              >
                <span className="display text-[1.75rem] leading-none text-gold">
                  {initials}
                </span>
              </div>
            </div>

            <RevealText
              as="h2"
              className="display mt-16 max-w-[11ch] text-[length:var(--text-display-l)] leading-[1.18] text-white"
            >
              {LEADERSHIP.ceo.name}
            </RevealText>

            <span data-mark-rule className="mt-7 block h-px w-24 origin-left bg-gold" />

            <p className="label mt-6 text-gold">{LEADERSHIP.ceo.role}</p>
            <p className="label mt-2 text-ash">
              {LEADERSHIP.ceo.base} · Since {COMPANY.founded}
            </p>

            {/* Ships only when there are real words to ship. */}
            {LEADERSHIP.ceo.statement ? (
              <blockquote className="mt-10 max-w-[36ch] border-l border-gold pl-6 text-[length:var(--text-lead)] italic leading-relaxed text-white">
                {LEADERSHIP.ceo.statement}
              </blockquote>
            ) : null}
          </div>

          {/* --- How the firm works ------------------------------------------ */}
          <div>
            <RevealText
              as="p"
              split="words"
              className="max-w-[54ch] text-[length:var(--text-lead)] leading-relaxed text-mist"
            >
              The firm has been held and run by the same family throughout. That is why the
              difficult parts of a land transaction sit inside our scope rather than beside it —
              there is nobody else to hand them to.
            </RevealText>

            <ol data-principles className="mt-[clamp(40px,5vw,64px)] grid gap-px bg-edge sm:grid-cols-2">
              {LEADERSHIP.principles.map((p, i) => (
                <li
                  key={p.title}
                  data-principle
                  className="group bg-carbon p-[clamp(24px,2.6vw,40px)] opacity-0 transition-colors duration-300 hover:bg-slate"
                >
                  <span className="numeral text-[0.75rem] text-gold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="display mt-4 text-[length:var(--text-title)] leading-snug text-white">
                    {p.title}
                  </h3>
                  <span className="mt-4 block h-px w-8 bg-gold transition-all duration-300 group-hover:w-16" />
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-mist">{p.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
