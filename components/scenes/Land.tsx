'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AmbientScene from '@/components/motion/AmbientScene';
import RevealText from '@/components/motion/RevealText';
import { formatNumber } from '@/lib/motion';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REACH: { value: number; suffix: string; label: string; note: string; text?: string }[] = [
  { value: 0, suffix: '', text: 'Howrah', label: 'District', note: 'Where we source land' },
  { value: 3000, suffix: '+', label: 'Acres transacted', note: 'Since 1981' },
  { value: 100, suffix: '+ ac', label: 'Parcel size', note: 'From a single acre upward' },
];

/**
 * Scene 5 — sourcing.
 *
 * The one section on the site that is about land nobody owns yet. It sits
 * between the configurator and the parks on purpose: the visitor has just
 * sized a requirement, and the next question is always "and if you have not
 * got it?".
 *
 * The footage does the arguing — open ground, from height, going on past the
 * frame. The figures only have to be legible on top of it.
 */
export default function Land() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      REACH.forEach((f, i) => {
        const el = root.current?.querySelector(`[data-count="${i}"]`);
        if (!el || f.text) return;

        const n = { v: 0 };
        gsap.to(n, {
          v: f.value,
          duration: 1.5,
          ease: 'power2.out',
          delay: i * 0.1,
          snap: { v: 1 },
          onUpdate: () => {
            el.textContent = formatNumber(n.v);
          },
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        });
      });

      gsap.fromTo(
        '[data-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <AmbientScene src={media('/media/loop-land.mp4')} poster={media('/media/loop-land-poster.jpg')} id="land">
      <div ref={root}>
        <p className="label text-gold">05 · Sourcing</p>

        <RevealText
          as="h2"
          className="display mt-7 max-w-[15ch] text-[length:var(--text-display-l)] text-white"
        >
          If we have not got it, we <span className="accent-italic">find</span> it.
        </RevealText>

        <RevealText
          as="p"
          split="words"
          className="mt-9 max-w-[58ch] text-[length:var(--text-lead)] leading-relaxed text-mist"
        >
          Half of this business is land nobody has listed. We identify the parcel, verify the
          title, negotiate directly with whoever holds it, and carry it through conversion and
          mutation until the record reads your name — anywhere in Howrah, from one acre to a
          hundred and more.
        </RevealText>

        <dl className="mt-[clamp(56px,8vw,104px)] grid gap-x-12 gap-y-12 sm:grid-cols-3">
          {REACH.map((f, i) => (
            <div key={f.label}>
              <span data-rule className="mb-5 block h-px w-full origin-left bg-white/25" />
              <dd className="numeral text-[length:var(--text-numeral)] leading-none text-gold">
                <span data-count={i}>{f.text ?? 0}</span>
                {f.suffix}
              </dd>
              <dt className="display mt-4 text-[length:var(--text-title)] text-white">
                {f.label}
              </dt>
              <p className="mt-2 max-w-[30ch] text-[0.875rem] leading-relaxed text-ash">
                {f.note}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </AmbientScene>
  );
}
