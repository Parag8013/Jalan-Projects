'use client';

import { useRef, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Props = {
  as?: ElementType;
  children: React.ReactNode;
  /** `lines` masks and lifts whole lines. `words` is lighter, for body copy. */
  split?: 'lines' | 'words';
  delay?: number;
  start?: string;
  className?: string;
  id?: string;
};

/**
 * Masked type reveal.
 *
 * Lines are clipped by their own wrapper and lifted in from below, so the text
 * appears to rise out of the page rather than fade onto it. This is the single
 * biggest difference between a site that feels designed and one that feels
 * assembled — every heading on the site runs through it.
 *
 * SplitText rewrites the DOM, so it is reverted on cleanup to hand the original
 * text nodes back to screen readers and to survive React re-renders.
 */
export default function RevealText({
  as: Tag = 'div',
  children,
  split = 'lines',
  delay = 0,
  start = 'top 82%',
  className = '',
  id,
}: Props) {
  const el = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!el.current) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        gsap.set(el.current, { opacity: 1 });
        return;
      }

      const instance = new SplitText(el.current, {
        type: split === 'lines' ? 'lines' : 'words',
        mask: split === 'lines' ? 'lines' : undefined,
        linesClass: 'reveal-line',
      });

      const targets = split === 'lines' ? instance.lines : instance.words;
      gsap.set(el.current, { opacity: 1 });

      gsap.from(targets, {
        yPercent: split === 'lines' ? 108 : 40,
        opacity: split === 'lines' ? 1 : 0,
        duration: split === 'lines' ? 0.95 : 0.6,
        ease: 'expo.out',
        stagger: split === 'lines' ? 0.085 : 0.012,
        delay,
        scrollTrigger: { trigger: el.current, start, once: true },
      });

      return () => instance.revert();
    },
    { scope: el },
  );

  return (
    // Hidden until split completes, so the unmasked text never flashes.
    <Tag ref={el} id={id} className={`opacity-0 ${className}`}>
      {children}
    </Tag>
  );
}
