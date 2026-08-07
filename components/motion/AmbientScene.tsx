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
  /** `light` washes to warm cream with ink type. `dark` inverts to the near-black ground. */
  tone?: 'light' | 'dark';
  id?: string;
  className?: string;
};

/**
 * Full-bleed ambient video with an overlay layer.
 *
 * The clip carries mood and camera movement; the children carry the facts.
 * Video is not fetched until the section reaches the viewport and pauses when
 * it leaves — several clips decoding at once froze the renderer outright.
 */
export default function AmbientScene({
  src,
  poster,
  children,
  tone = 'light',
  id,
  className = '',
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
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
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

  const wash =
    tone === 'dark'
      ? 'bg-gradient-to-b from-ink/95 via-ink/88 to-ink/97'
      : 'bg-gradient-to-b from-paper/94 via-paper/78 to-paper/96';

  return (
    <section
      ref={root}
      id={id}
      className={`relative z-10 overflow-hidden ${tone === 'dark' ? 'bg-ink text-white' : 'bg-paper text-ink'} ${className}`}
    >
      <div data-parallax className="absolute inset-0 -top-[7%] h-[114%]">
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

      <div aria-hidden="true" className={`absolute inset-0 ${wash}`} />
      <div className="relative px-[var(--spacing-gutter)] py-[var(--spacing-section)]">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </div>
    </section>
  );
}
