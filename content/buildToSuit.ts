/**
 * Build-to-suit specifications.
 *
 * ⚠ PLACEHOLDER FIGURES — replace with Jalan Projects' real ranges before ship.
 *
 * The rule from docs/SCROLL-CHOREOGRAPHY.md: every animated quantity is a real
 * quantity. The whole design argues this company is precise about land, so a
 * fabricated figure inside a precision aesthetic does more damage than a plain
 * paragraph would. Nothing here goes live unverified.
 */

export type Stage = {
  id: string;
  /** Drawing-sheet label, shown in mono. */
  label: string;
  /** The specification this stage reveals. */
  spec: string;
  /** Plain-language detail. */
  detail: string;
};

export const FRAME_STAGES: Stage[] = [
  {
    id: 'foundation',
    label: 'RCC footing',
    spec: 'M25 grade',
    detail: 'Isolated pad footings, depth to suit soil bearing capacity at site.',
  },
  {
    id: 'columns',
    label: 'Eave height',
    spec: '9 – 14 m',
    detail: 'Built-up steel columns. Height set by your racking and MHE reach.',
  },
  {
    id: 'rafters',
    label: 'Clear span',
    spec: '24 – 40 m',
    detail: 'Column-free floor across the full span. No obstruction to layout.',
  },
  {
    id: 'purlins',
    label: 'Bay spacing',
    spec: '6 – 8 m',
    detail: 'Z-section purlins with sag rods. Bay set by span and load case.',
  },
  {
    id: 'sheeting',
    label: 'Roof and wall',
    spec: '0.5 mm PPGI',
    detail: 'Insulated profile sheeting. Turbo ventilators and skylights to spec.',
  },
  {
    id: 'docks',
    label: 'Dock levellers',
    spec: '6 – 12 T',
    detail: 'Hydraulic levellers with dock shelters, apron to trailer turning radius.',
  },
  {
    id: 'floor',
    label: 'Floor load',
    spec: '5 – 10 T/sqm',
    detail: 'Laser-screeded VDF floor, FM2 tolerance, joint-free bay construction.',
  },
];

/** Geometry the configurability beat scrubs between. */
export const SPAN_RANGE = { min: 24, max: 40, unit: 'm' } as const;
export const EAVE_RANGE = { min: 9, max: 14, unit: 'm' } as const;

/**
 * The reference building — the one the hero footage assembles.
 *
 * These are quoted on screen beside the film, so the thing the visitor watches
 * being built has to be the thing the specification describes. If the real
 * ranges above change, change these with them, and say so in the Flow prompt so
 * the next generation matches.
 */
export const REFERENCE = {
  span: 30,
  eave: 12,
  ridge: 15.5,
  bays: 8,
  bay: 7.5,
  get length() {
    return this.bays * this.bay;
  },
} as const;
