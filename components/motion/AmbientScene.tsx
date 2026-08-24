'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { EASE } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  src: string;
  poster: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** How hard the scrim sits on the footage. Raise it under dense copy. */
  scrim?: 'light' | 'heavy';
};

/**
 * Full-bleed looping footage with an overlay layer.
 *
 * The clip carries mood and camera movement; the children carry the facts.
 *
 * The video is not fetched until the section reaches the viewport and pauses
 * when it leaves. Several clips decoding at once froze the renderer outright,
 * and on a page with this much footage that is not a theoretical risk.
 */
export default function AmbientScene({
  src,
  poster,
  children,
  id,
  className = '',
  scrim = 'light',
}: Props) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduced) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            const v = video.current;
            if (!v) return;
            if (self.isActive) {
              if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
              v.play().catch(() => {});
            } else {
              v.pause();
            }
          },
        });

        gsap.to('[data-parallax]', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.06,
        ease: EASE.reveal,
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id={id}
      className={`grain relative z-10 overflow-hidden bg-void ${className}`}
    >
      <div data-parallax className="absolute inset-0 -top-[8%] h-[116%]">
        <video
          ref={video}
          className="h-full w-full object-cover motion-reduce:hidden"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="hidden h-full w-full object-cover motion-reduce:block"
        />
      </div>

      <div className="vignette" aria-hidden="true" />
      {/* Tuned for daylight footage, and lighter than it used to be.

          The previous values — 0.82/0.6/0.9 and 0.9/0.82/0.94 — were set
          against near-black clips, where a heavy wash costs nothing because
          there is nothing under it to lose. Over a sunlit field or a lit
          industrial park the same values read as a grey sheet laid over a
          photograph, and they throw away the brightness the footage was
          regenerated to get.

          The weight is now concentrated at the top and bottom edges, where the
          type actually sits, and the middle is allowed to stay bright. That is
          the shape a daylight scrim wants: dark where the words are, open
          where the picture is. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            scrim === 'heavy'
              ? 'linear-gradient(to bottom, rgba(7,7,10,0.86), rgba(7,7,10,0.66) 45%, rgba(7,7,10,0.9))'
              : 'linear-gradient(to bottom, rgba(7,7,10,0.78), rgba(7,7,10,0.46) 45%, rgba(7,7,10,0.84))',
        }}
      />

      <div className="relative px-[var(--spacing-gutter)] py-[var(--spacing-section)]">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </div>
    </section>
  );
}
