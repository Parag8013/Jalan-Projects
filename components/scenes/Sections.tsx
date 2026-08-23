'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AmbientScene from '@/components/motion/AmbientScene';
import RevealText from '@/components/motion/RevealText';
import { COMPANY, PARKS, PROCESS, QUESTIONS, SECTORS } from '@/content/site';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* -------------------------------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="label text-gold">{children}</p>;
}

function SectionHead({
  title,
  accent,
  meta,
  lead,
}: {
  title: string;
  accent?: string;
  meta: string;
  lead?: string;
}) {
  return (
    <header className="mb-[clamp(40px,6vw,80px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <RevealText as="h2" className="display max-w-[15ch] text-[length:var(--text-display-l)] text-white">
          {title}
          {accent ? (
            <>
              {' '}
              <span className="accent-italic">{accent}</span>
            </>
          ) : null}
        </RevealText>
        <div data-reveal>
          <Eyebrow>{meta}</Eyebrow>
        </div>
      </div>
      {lead ? (
        <RevealText
          as="p"
          split="words"
          className="mt-8 max-w-[56ch] text-[length:var(--text-lead)] text-mist"
        >
          {lead}
        </RevealText>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 8 — Sectors. A marquee that reacts to scroll velocity and direction.  */

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
    <section ref={root} className="grain relative z-10 overflow-hidden border-y border-edge bg-slate py-14">
      <div className="mb-9 px-[var(--spacing-gutter)]">
        <div className="mx-auto w-full max-w-[1440px]">
          <Eyebrow>08 · Sectors we build for</Eyebrow>
        </div>
      </div>

      <div className="flex w-max marquee-track" aria-hidden="true">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex items-center">
            {SECTORS.map((s) => (
              <li key={s} className="flex items-center whitespace-nowrap">
                <span className="display px-8 text-[clamp(1.75rem,3.4vw,3rem)] text-white">{s}</span>
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
/* Scene 9 — Process. Scrubbed rail, steps light as the line reaches them.    */

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
      className="grain relative z-10 bg-carbon px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <SectionHead
          title="How land actually"
          accent="reaches you"
          meta="09 · Process · 6 stages"
          lead="Conversion and mutation are the stages buyers are warned about. They are ours to handle, and they are included."
        />

        <div className="relative mb-12 h-px w-full bg-edge">
          <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        </div>

        <ol className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((p, i) => (
            <li key={p.step} data-step className="group">
              <div className="flex items-center gap-3">
                <span data-dot className="h-2 w-2 rotate-45 bg-gold" />
                <span className="numeral text-[0.8125rem] text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="numeral ml-auto text-[0.8125rem] text-ash">{p.duration}</span>
              </div>
              <h3 className="display mt-5 text-[length:var(--text-display-s)] text-white">{p.step}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-mist">{p.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 12 — Questions. Expand on click; only one open at a time.             */

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
      className="grain relative z-10 bg-void px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <SectionHead title="Before you" accent="call" meta="11 · Questions" />

        <div className="border-t border-edge">
          {QUESTIONS.map((item, i) => (
            <details
              key={item.q}
              data-q
              name="questions"
              open={i === 0}
              className="group border-b border-edge"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-8 py-7 [&::-webkit-details-marker]:hidden">
                <span className="display max-w-[34ch] text-[length:var(--text-title)] text-white transition-colors duration-200 group-hover:text-gold">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="numeral shrink-0 text-[1.25rem] text-gold transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-8 text-[0.9375rem] leading-relaxed text-mist">
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
      src="/media/loop-close.mp4"
      poster="/media/loop-close-poster.jpg"
      scrim="heavy"
      id="enquiry"
      className="min-h-svh"
    >
      <div className="flex min-h-[62vh] flex-col justify-center">
        <Eyebrow>12 · Enquiry</Eyebrow>
        <RevealText
          as="h2"
          className="display-xl mt-7 max-w-[13ch] text-[length:var(--text-display-xl)]"
        >
          Tell us the <span className="accent-italic text-gold">requirement</span>
        </RevealText>
        <RevealText
          as="p"
          split="words"
          className="mt-9 max-w-[50ch] text-[length:var(--text-lead)] text-mist"
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

        <div className="mt-20 grid gap-x-10 gap-y-8 border-t border-edge pt-10 sm:grid-cols-3">
          {PARKS.map((park) => (
            <div key={park.slug}>
              <p className="label text-ash">{park.place}</p>
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
