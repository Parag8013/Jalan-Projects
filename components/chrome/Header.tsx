'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { COMPANY } from '@/content/site';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const NAV = [
  { label: 'What we do', href: '#capabilities' },
  { label: 'Parks', href: '#parks' },
  { label: 'Build-to-suit', href: '#build' },
  { label: 'Process', href: '#process' },
  { label: 'Leadership', href: '#leadership' },
];

/**
 * Fixed header.
 *
 * The site is one dark theatre throughout, so the bar no longer tracks a
 * register changing underneath it — the whole light/dark interpolation this
 * file used to carry went with the cream sections.
 *
 * It opens transparent over the hero so the assembly gets a clean full-bleed
 * frame, then takes a translucent ground and a hairline once the page moves.
 * Blurring only after the page has scrolled matters: a permanently blurred
 * fixed bar forces a full-viewport composite on every frame of the scrub.
 */
export default function Header() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        start: 'top -120',
        end: 99999,
        onToggle: (self) => {
          gsap.to('[data-bar]', {
            backgroundColor: self.isActive ? 'rgba(7,7,10,0.72)' : 'rgba(7,7,10,0)',
            backdropFilter: self.isActive ? 'blur(14px)' : 'blur(0px)',
            duration: 0.4,
            ease: 'power2.out',
          });
          gsap.to('[data-hairline]', {
            opacity: self.isActive ? 1 : 0,
            duration: 0.4,
            ease: 'power2.out',
          });
          /* The top-of-page gradient hands over to the solid bar rather than
             sitting under it — two scrims stacked read as a heavier, muddier
             band than either was tuned to be. */
          gsap.to('[data-skyscrim]', {
            opacity: self.isActive ? 0 : 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        },
      });

      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-50">
      <div data-bar className="relative">
        {/* Ground for the nav at the very top of the page, where `data-bar` is
            still fully transparent.

            This is new with daylight footage and it is not optional. The bar
            only fades in after 120px of scroll, which was fine while the hero
            opened on a black void — white type on black needs no help. The
            hero now opens on a bright sky with white cloud, and unscrimmed
            white and mist type on that is genuinely unreadable rather than
            merely low-contrast.

            A gradient rather than a filled bar, so the top of the page still
            reads as open sky rather than as a chrome strip. It extends past
            the bar's own height for the same reason: a hard bottom edge would
            be a bar by another name. */}
        <span
          data-skyscrim
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[190%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(7,7,10,0.78) 0%, rgba(7,7,10,0.52) 38%, rgba(7,7,10,0.22) 68%, transparent 100%)',
          }}
        />
        <span
          data-hairline
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-white/12 opacity-0"
        />

        {/* `relative` so it paints above the two absolutely-positioned scrims
            behind it. Positioned elements win over static ones regardless of
            DOM order, so without this the gradient covers the nav. */}
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-[var(--spacing-gutter)] py-4">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label={`${COMPANY.name} — home`}
          >
            {/* The crest is a white hexagonal badge, transparent outside its
                gold outline, so it sits on the dark ground with no plate
                behind it. Sized off the wordmark's
                cap height rather than a round number, so the two read as one
                lockup instead of a badge parked next to some type. */}
            <img
              src="/crest.png"
              alt=""
              width={185}
              height={241}
              className="h-8 w-auto shrink-0 select-none"
              draggable={false}
            />
            <span className="display text-[1.0625rem] leading-none tracking-tight text-white">
              Jalan <span className="text-gold">Projects</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="label text-ash transition-colors duration-200 hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
              className="numeral hidden text-[0.875rem] text-mist transition-colors duration-200 hover:text-white sm:block"
            >
              {COMPANY.phone}
            </a>
            <a
              href="#enquiry"
              className="bg-gold px-5 py-2.5 text-[0.8125rem] font-semibold text-ink transition-colors duration-200 hover:bg-white"
            >
              Enquire
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
