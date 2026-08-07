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
];

/**
 * Fixed header, always on cream.
 *
 * A transparent-over-hero bar was the first instinct, but the crest is a JPEG
 * on a white field: `mix-blend-multiply` only blends within the header's own
 * stacking context, so over video the white box stayed visible. An opaque bar
 * gives the blend a cream backdrop to disappear into, and reads calmer.
 * It deepens its hairline once the page moves.
 */
export default function Header() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onToggle: (self) => {
          gsap.to('[data-bar]', {
            borderBottomColor: self.isActive ? 'var(--color-line)' : 'rgba(231,224,208,0)',
            duration: 0.35,
            ease: 'power2.out',
          });
        },
      });
    },
    { scope: root },
  );

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-50">
      <div data-bar className="border-b border-transparent bg-paper">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-[var(--spacing-gutter)] py-3">
          <a href="#top" className="flex items-center gap-3" aria-label={`${COMPANY.name} — home`}>
            {/* The crest is a small JPEG on a white field. It sits on cream, so
                the field is imperceptible at this size. A vector original would
                let it go anywhere — see docs/VERIFY-BEFORE-LAUNCH.md. */}
            <img
              src="/logo-jalan.jpg"
              alt=""
              aria-hidden="true"
              width={40}
              height={45}
              className="h-11 w-auto mix-blend-multiply"
            />
            <span className="display text-[1.0625rem] leading-none tracking-tight">
              Jalan <span className="text-gold-deep">Projects</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="label text-grey transition-colors duration-200 hover:text-ink"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}
              className="numeral hidden text-[0.875rem] text-ink transition-colors duration-200 hover:text-gold-deep sm:block"
            >
              {COMPANY.phone}
            </a>
            <a
              href="#enquiry"
              className="bg-ink px-5 py-2.5 text-[0.8125rem] font-semibold text-paper transition-colors duration-200 hover:bg-gold-deep"
            >
              Enquire
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
