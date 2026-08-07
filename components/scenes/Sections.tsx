'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AmbientScene from '@/components/motion/AmbientScene';
import RevealText from '@/components/motion/RevealText';
import { COMPANY, PARKS, PROCESS, QUESTIONS, SCALE_FIGURES, SECTORS } from '@/content/site';
import { EASE, formatNumber } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* -------------------------------------------------------------------------- */

function Eyebrow({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return <p className={`label ${tone === 'dark' ? 'text-white/55' : 'text-grey'}`}>{children}</p>;
}

function SectionHead({
  title,
  accent,
  meta,
  lead,
  tone = 'light',
}: {
  title: string;
  accent?: string;
  meta: string;
  lead?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <header className="mb-[clamp(40px,6vw,80px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <RevealText as="h2" className="display max-w-[15ch] text-[length:var(--text-display-l)]">
          {title}
          {accent ? (
            <>
              {' '}
              <span className={`accent-italic ${tone === 'dark' ? 'text-gold' : ''}`}>{accent}</span>
            </>
          ) : null}
        </RevealText>
        <div data-reveal>
          <Eyebrow tone={tone}>{meta}</Eyebrow>
        </div>
      </div>
      {lead ? (
        <RevealText
          as="p"
          split="words"
          className={`mt-8 max-w-[56ch] text-[length:var(--text-lead)] ${tone === 'dark' ? 'text-white/75' : 'text-grey'}`}
        >
          {lead}
        </RevealText>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 7 — Scale band. Counters on a plain ground, no footage competing.     */

export function ScaleBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      SCALE_FIGURES.forEach((f, i) => {
        const el = root.current?.querySelector(`[data-count="${i}"]`);
        if (!el) return;
        const n = { v: 0 };
        gsap.to(n, {
          v: f.value,
          duration: 1.5,
          ease: 'power2.out',
          delay: i * 0.09,
          onUpdate: () => {
            el.textContent = f.decimals ? n.v.toFixed(f.decimals) : formatNumber(n.v);
          },
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        });
      });

      // Each figure's rule draws as its number lands.
      gsap.fromTo(
        '[data-fig-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative z-10 bg-white px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-14">
          <Eyebrow>07 · Scale</Eyebrow>
        </div>
        <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {SCALE_FIGURES.map((f, i) => (
            <div key={f.label} className="group">
              <span data-fig-rule className="mb-5 block h-px w-full origin-left bg-ink" />
              <dd className="numeral text-[length:var(--text-numeral)] leading-none text-gold-deep">
                <span data-count={i}>0</span>
                {f.suffix}
              </dd>
              <dt className="display mt-4 text-[length:var(--text-title)]">{f.label}</dt>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-grey">{f.note}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 8 — Handover. Spec cards reveal on a scrubbed rail.                   */

export function Handover() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-spec-card]',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <AmbientScene src="/media/m6-warehouse.mp4" poster="/media/m6-poster.jpg" tone="light">
      <div ref={root}>
        <SectionHead
          title="Handed over"
          accent="complete"
          meta="08 · Build-to-suit · Handover"
          lead="Floor, docks, power, drainage, apron, gatehouse. Finished to specification and handed to you ready to operate — not a shell with a snag list."
        />

        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Floor', '5 – 10 T/sqm', 'Laser-screeded VDF, FM2 tolerance, joint-free bays.'],
            ['Docks', '6 – 12 T', 'Hydraulic levellers, shelters, apron to your turning radius.'],
            ['Roof', '0.5 mm PPGI', 'Insulated profile sheet, turbo ventilators, skylights.'],
            ['Power', 'To sanction', 'Dedicated transformer, LT panel, standby provision.'],
          ].map(([k, v, d]) => (
            <div
              key={k}
              data-spec-card
              className="group bg-paper p-7 transition-colors duration-300 hover:bg-white"
            >
              <Eyebrow>{k}</Eyebrow>
              <p className="numeral mt-3 text-[1.375rem] leading-none text-gold-deep">{v}</p>
              <span className="mt-4 block h-px w-8 bg-gold transition-all duration-300 group-hover:w-16" />
              <p className="mt-4 text-[0.875rem] leading-relaxed text-grey">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </AmbientScene>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 9 — Sectors. A marquee that reacts to scroll velocity and direction.  */

export function Sectors() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      // Scroll speed feeds the marquee: faster scrolling drags the band along,
      // and reversing direction reverses it. Cheap, and it makes the page feel
      // physically connected to the wheel.
      const track = root.current?.querySelector<HTMLElement>('.marquee-track');
      if (!track) return;

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 5);
          gsap.set(track, {
            animationDuration: `${38 / boost}s`,
            animationDirection: self.direction === 1 ? 'normal' : 'reverse',
          });
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative z-10 overflow-hidden border-y border-line bg-shell py-14">
      <div className="mb-9 px-[var(--spacing-gutter)]">
        <div className="mx-auto w-full max-w-[1440px]">
          <Eyebrow>09 · Sectors we build for</Eyebrow>
        </div>
      </div>

      <div className="flex w-max marquee-track" aria-hidden="true">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex items-center">
            {SECTORS.map((s) => (
              <li key={s} className="flex items-center whitespace-nowrap">
                <span className="display px-8 text-[clamp(1.75rem,3.4vw,3rem)] text-ink">{s}</span>
                <span className="h-2 w-2 rotate-45 bg-gold" />
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* The marquee is decorative; this carries the same list to assistive tech. */}
      <p className="sr-only">Sectors we build for: {SECTORS.join(', ')}.</p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 10 — Process. Scrubbed rail, steps light as the line reaches them.    */

export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]');

      gsap.to('[data-progress]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 75%', scrub: 0.6 },
      });

      steps.forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0.25, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          },
        );
        gsap.fromTo(
          step.querySelector('[data-dot]'),
          { scale: 0 },
          {
            scale: 1,
            duration: 0.5,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="process"
      className="relative z-10 bg-paper px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <SectionHead
          title="How land actually"
          accent="reaches you"
          meta="10 · Process · 6 stages"
          lead="Conversion and mutation are the stages buyers are warned about. They are ours to handle, and they are included."
        />

        <div className="relative mb-12 h-px w-full bg-line">
          <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </div>

        <ol className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((p, i) => (
            <li key={p.step} data-step className="group">
              <div className="flex items-center gap-3">
                <span data-dot className="h-2 w-2 rotate-45 bg-gold" />
                <span className="numeral text-[0.8125rem] text-gold-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="numeral ml-auto text-[0.8125rem] text-grey">{p.duration}</span>
              </div>
              <h3 className="display mt-5 text-[length:var(--text-display-s)]">{p.step}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-grey">{p.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 11 — Questions. Expand on click; only one open at a time.             */

export function Questions() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-q]',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative z-10 bg-white px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <SectionHead title="Before you" accent="call" meta="11 · Questions" />

        <div className="border-t border-line">
          {QUESTIONS.map((item, i) => (
            <details
              key={item.q}
              data-q
              name="questions"
              open={i === 0}
              className="group border-b border-line"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-8 py-7 [&::-webkit-details-marker]:hidden">
                <span className="display max-w-[34ch] text-[length:var(--text-title)] transition-colors duration-200 group-hover:text-gold-deep">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="numeral shrink-0 text-[1.25rem] text-gold-deep transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-8 text-[0.9375rem] leading-relaxed text-grey">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 12 — Close. The model reveal, then the enquiry.                       */

export function Close() {
  return (
    <AmbientScene
      src="/media/m8-close.mp4"
      poster="/media/m8-poster.jpg"
      tone="dark"
      id="enquiry"
      className="min-h-svh"
    >
      <div className="flex min-h-[62vh] flex-col justify-center">
        <Eyebrow tone="dark">12 · Enquiry</Eyebrow>
        <RevealText
          as="h2"
          className="display-xl mt-7 max-w-[13ch] text-[length:var(--text-display-xl)]"
        >
          Tell us the <span className="accent-italic text-gold">requirement</span>
        </RevealText>
        <RevealText
          as="p"
          split="words"
          className="mt-9 max-w-[50ch] text-[length:var(--text-lead)] text-white/75"
        >
          Area, location, power, timeline. If we have it, we will show you. If we do not, we will
          find it.
        </RevealText>

        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
            className="bg-gold px-8 py-4 text-[0.9375rem] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            Call {COMPANY.phone}
          </a>
          <a
            href={`https://wa.me/${COMPANY.whatsapp}`}
            className="border border-white/35 px-8 py-4 text-[0.9375rem] font-medium transition-colors duration-200 hover:bg-white hover:text-ink"
          >
            WhatsApp
          </a>
          <a
            href="#requirement"
            className="border border-white/35 px-8 py-4 text-[0.9375rem] font-medium transition-colors duration-200 hover:bg-white hover:text-ink"
          >
            Size your requirement
          </a>
        </div>

        <div className="mt-20 grid gap-x-10 gap-y-8 border-t border-white/20 pt-10 sm:grid-cols-3">
          {PARKS.map((park) => (
            <div key={park.slug}>
              <p className="label text-white/55">{park.place}</p>
              <p className="mt-2 text-[0.9375rem]">{park.name}</p>
              <p className="numeral mt-1 text-[0.875rem] text-gold">
                {park.availableAcres} acres available
              </p>
            </div>
          ))}
        </div>
      </div>
    </AmbientScene>
  );
}
