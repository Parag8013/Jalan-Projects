'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import RevealText from '@/components/motion/RevealText';
import { COMPANY, LEADERSHIP, SCALE_FIGURES } from '@/content/site';
import { formatNumber } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scene 2 — the ledger.
 *
 * The hero ends on the ink ground with footage behind it, so the page cannot
 * snap back to cream on the very next section without throwing away everything
 * the build just earned. This band stays dark, states what the company is in
 * one paragraph, and puts the scale figures underneath — credibility placed
 * immediately after the spectacle rather than three screens later.
 *
 * Three across on large screens, not four or five: "37,84,080+" is ten mono
 * characters at numeral size, and a quarter of a laptop-width row cannot
 * hold it.
 *
 * The return to cream happens at the capability stack, which is where the site
 * stops performing and starts explaining.
 */
export default function Ledger() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      SCALE_FIGURES.forEach((f, i) => {
        const el = root.current?.querySelector(`[data-count="${i}"]`);
        if (!el || f.text) return;

        const n = { v: 0 };
        gsap.to(n, {
          v: f.value,
          duration: 1.6,
          ease: 'power2.out',
          delay: i * 0.1,
          onUpdate: () => {
            el.textContent = f.decimals ? n.v.toFixed(f.decimals) : formatNumber(n.v);
          },
          scrollTrigger: { trigger: root.current, start: 'top 68%', once: true },
        });
      });

      gsap.fromTo(
        '[data-fig-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 68%', once: true },
        },
      );

      gsap.fromTo(
        '[data-sig]',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 55%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="company"
      className="grain relative z-10 bg-carbon px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label text-gold">02 · The company</p>
            <RevealText
              as="h2"
              className="display mt-7 max-w-[13ch] text-[length:var(--text-display-l)] text-white"
            >
              A land business that also <span className="accent-italic text-gold">builds</span>.
            </RevealText>
          </div>

          <div className="lg:pt-16">
            <RevealText
              as="p"
              split="words"
              className="max-w-[58ch] text-[length:var(--text-lead)] leading-relaxed text-mist"
            >
              Jalan Projects has worked on industrial land in West Bengal since{' '}
              {COMPANY.founded}, out of {COMPANY.base}. Half of what we do is find land — not
              list it, find it: identify the parcel, verify the title, negotiate with whoever
              holds it, and carry it through conversion and mutation until the record reads your
              name. The other half is what gets built on it, in our own parks or on ground we
              sourced for you.
            </RevealText>

            <div data-sig className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 opacity-0">
              <span className="h-px w-10 bg-gold" />
              <span className="display display-name text-[1.0625rem] text-white">{LEADERSHIP.ceo.name}</span>
              <span className="label text-ash">{LEADERSHIP.ceo.role}</span>
            </div>
          </div>
        </div>

        <dl className="mt-[clamp(56px,8vw,112px)] grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {SCALE_FIGURES.map((f, i) => (
            <div key={f.label}>
              <span data-fig-rule className="mb-5 block h-px w-full origin-left bg-edge" />
              <dd className="numeral text-[length:var(--text-numeral)] leading-none text-gold">
                <span data-count={i}>{f.text ?? 0}</span>
                {f.suffix}
              </dd>
              <dt className="display mt-4 text-[length:var(--text-title)] text-white">
                {f.label}
              </dt>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-ash">{f.note}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
