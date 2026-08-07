'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { gsap } from 'gsap';
import RevealText from '@/components/motion/RevealText';
import { COMPANY } from '@/content/site';
import { SQ_FT_PER_ACRE } from '@/content/scale';
import { formatNumber } from '@/lib/motion';

/**
 * ⚠ RATIOS ARE GENERATED — see docs/VERIFY-BEFORE-LAUNCH.md.
 * Coverage is the share of a plot that ends up under roof once roads, apron,
 * setbacks and parking are taken out.
 */
const USES = [
  { id: 'warehouse', label: 'Warehouse', coverage: 0.45, baysPerAcre: 17, span: '24 – 40 m' },
  { id: 'factory', label: 'Factory shed', coverage: 0.4, baysPerAcre: 8, span: '18 – 30 m' },
  { id: 'logistics', label: 'Logistics hub', coverage: 0.38, baysPerAcre: 24, span: '30 – 40 m' },
] as const;

const STOPS = [1, 2, 5, 10, 20, 40, 70, 100];

/**
 * Scene 4 — Requirement.
 *
 * Replaces a scroll-driven diagram that only ever grew a rectangle. A buyer
 * cannot feel an acre, and watching a box scale did not help — but dragging to
 * *their own* number and watching built area, dock count and unit count resolve
 * does. It also does something no animation can: it collects the requirement,
 * then hands it to the enquiry pre-written.
 */
export default function Configurator() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(3); // 10 acres
  const [use, setUse] = useState<(typeof USES)[number]['id']>('warehouse');

  const acres = STOPS[idx];
  const spec = useMemo(() => USES.find((u) => u.id === use)!, [use]);

  const builtSqFt = Math.round(acres * SQ_FT_PER_ACRE * spec.coverage);
  const bays = Math.round(acres * spec.baysPerAcre);
  const units = Math.max(1, Math.round(builtSqFt / 40000));

  /* Numbers roll rather than snap — it makes the control feel connected to the
     input. Deliberately a plain effect, not useGSAP: its dependency handling
     did not re-fire on the use-type toggle, so the figures kept showing the
     previous facility's numbers. */
  const shown = useRef<Record<string, number>>({});
  useEffect(() => {
    const targets: Record<string, number> = { sqft: builtSqFt, bays, units, acres };
    const tweens = Object.entries(targets).map(([key, to]) => {
      const el = root.current?.querySelector(`[data-out="${key}"]`);
      if (!el) return null;
      const o = { v: shown.current[key] ?? 0 };
      return gsap.to(o, {
        v: to,
        duration: 0.5,
        ease: 'power3.out',
        snap: { v: 1 },
        onUpdate: () => {
          el.textContent = formatNumber(o.v);
        },
        onComplete: () => {
          shown.current[key] = to;
        },
      });
    });
    return () => tweens.forEach((t) => t?.kill());
  }, [builtSqFt, bays, units, acres]);

  // Footprint preview: `units` blocks laid out on the plot.
  const blocks = Array.from({ length: Math.min(units, 24) });

  const enquiry = `Requirement: ${acres} acres · ${spec.label} · approx ${formatNumber(builtSqFt)} sq ft built · ${bays} dock bays`;

  return (
    <section
      ref={root}
      id="requirement"
      aria-labelledby="req-heading"
      className="relative z-10 bg-shell px-[var(--spacing-gutter)] py-[var(--spacing-section)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-[clamp(40px,6vw,72px)] flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
          <RevealText
            as="h2"
            id="req-heading"
            className="display max-w-[16ch] text-[length:var(--text-display-l)]"
          >
            Size it before you <span className="accent-italic">call us</span>
          </RevealText>
          <p className="label text-grey">04 · Requirement · Interactive</p>
        </div>

        <div className="grid gap-px border border-line bg-line lg:grid-cols-[1fr_1fr]">
          {/* ---- Controls ---- */}
          <div className="bg-paper p-[clamp(24px,3.5vw,52px)]">
            <label htmlFor="acres" className="label text-grey">
              Land required
            </label>
            <p className="numeral mt-3 text-[clamp(2.5rem,5vw,4rem)] leading-none text-gold-deep">
              <span data-out="acres">{acres}</span>
              <span className="ml-3 text-[0.28em] tracking-[0.2em] text-grey">ACRES</span>
            </p>

            <input
              id="acres"
              type="range"
              min={0}
              max={STOPS.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="range-gold mt-8 w-full"
              aria-valuetext={`${acres} acres`}
            />
            <div className="mt-3 flex justify-between">
              {STOPS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`numeral cursor-pointer px-1 py-1 text-[0.75rem] transition-colors duration-200 ${
                    i === idx ? 'text-ink' : 'text-grey/60 hover:text-ink'
                  }`}
                  aria-label={`${s} acres`}
                >
                  {s}
                </button>
              ))}
            </div>

            <fieldset className="mt-12">
              <legend className="label text-grey">Intended use</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {USES.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUse(u.id)}
                    aria-pressed={use === u.id}
                    className={`cursor-pointer border px-5 py-3 text-[0.9375rem] transition-colors duration-200 ${
                      use === u.id
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line text-ink hover:border-ink/50'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <a
              href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(enquiry)}`}
              className="mt-12 inline-flex items-center gap-3 bg-gold px-8 py-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
            >
              Send this requirement
              <span aria-hidden="true">→</span>
            </a>
            <p className="mt-4 max-w-[44ch] text-[0.8125rem] leading-relaxed text-grey">
              Opens WhatsApp with the figures above already written out. Change anything you like
              before sending.
            </p>
          </div>

          {/* ---- Live output ---- */}
          <div className="bg-paper p-[clamp(24px,3.5vw,52px)]">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-9">
              {/* The rendered value is the *final* figure, not a zero
                  placeholder: React resets textContent on every re-render, so a
                  literal 0 here silently wiped the running tween. Render lands
                  first, then the effect animates from the previous value. */}
              {(
                [
                  ['Built area', 'sqft', 'sq ft under roof', builtSqFt],
                  ['Dock bays', 'bays', 'at standard layout', bays],
                  ['Units', 'units', 'of ~40,000 sq ft', units],
                ] as const
              ).map(([label, key, note, value]) => (
                <div key={key} className={key === 'sqft' ? 'col-span-2' : ''}>
                  <dt className="label text-grey">{label}</dt>
                  <dd
                    className={`numeral mt-2 leading-none text-ink ${
                      key === 'sqft' ? 'text-[clamp(2rem,3.6vw,3rem)]' : 'text-[1.75rem]'
                    }`}
                  >
                    <span data-out={key}>{formatNumber(value)}</span>
                  </dd>
                  <p className="mt-2 text-[0.8125rem] text-grey">{note}</p>
                </div>
              ))}
              <div>
                <dt className="label text-grey">Clear span</dt>
                <dd className="numeral mt-2 text-[1.75rem] leading-none text-ink">{spec.span}</dd>
                <p className="mt-2 text-[0.8125rem] text-grey">column-free</p>
              </div>
            </dl>

            {/* Footprint preview. Blocks are the units, the frame is the plot. */}
            <div className="mt-12">
              <p className="label mb-4 text-grey">Indicative footprint</p>
              <div className="relative aspect-[16/9] w-full border border-gold-deep/70 bg-gold-wash/50 p-[4%]">
                <div className="flex h-full flex-wrap content-start gap-[1.5%]">
                  {blocks.map((_, i) => (
                    <span
                      key={i}
                      className="block bg-ink/80"
                      style={{
                        width: `${units <= 4 ? 46 : units <= 9 ? 30 : units <= 16 ? 22 : 15}%`,
                        height: units <= 4 ? '44%' : units <= 9 ? '30%' : units <= 16 ? '22%' : '15%',
                      }}
                    />
                  ))}
                </div>
                {units > 24 ? (
                  <span className="numeral absolute bottom-2 right-3 text-[0.75rem] text-ink/70">
                    +{units - 24} more
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
