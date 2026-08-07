/**
 * Shared motion contract. Every scene resolves its choreography through the
 * same three contexts so behaviour stays consistent across the site.
 *
 * The rule from docs/SCROLL-CHOREOGRAPHY.md: information never degrades across
 * breakpoints, only the choreography does.
 */
export const MOTION_CONTEXTS = {
  /** Full choreography. Pinned scenes allowed — 3 site-wide, no more. */
  isDesktop: '(min-width: 1024px)',
  /** Reduced choreography. One pin only. */
  isTablet: '(min-width: 768px) and (max-width: 1023px)',
  /** No pinning. Stepped reveals carrying identical facts. */
  isMobile: '(max-width: 767px)',
  /** Final states, opacity fades only. */
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

export const EASE = {
  reveal: 'power2.out',
  draw: 'power2.inOut',
  hover: 'power1.out',
} as const;

export const DURATION = {
  reveal: 0.35,
  draw: 0.9,
  hover: 0.18,
  count: 1.2,
} as const;

/** Indian grouping — lakh/crore is what this audience reads. */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}
