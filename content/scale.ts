/**
 * Scale comparator steps.
 *
 * ⚠ `bays` IS A PLACEHOLDER RATIO — replace with Jalan Projects' real figure for
 * dock bays per acre at standard layout before this ships. Everything else here
 * is arithmetic (1 acre = 43,560 sq ft) and is safe.
 *
 * Reference unit is dock bays, never football fields. This audience thinks in
 * bays, clear span and square feet; a stadium comparison talks down to them.
 */
export type ScaleStep = {
  acres: number;
  /** Dock bays the parcel supports at standard layout. */
  bays: number;
  note: string;
};

export const SQ_FT_PER_ACRE = 43_560;

export const SCALE_STEPS: ScaleStep[] = [
  { acres: 1, bays: 17, note: 'A single unit with its own apron and turning circle.' },
  { acres: 5, bays: 85, note: 'A standalone facility with room to expand later.' },
  { acres: 20, bays: 340, note: 'A regional distribution centre serving eastern India.' },
  { acres: 100, bays: 1_700, note: 'A dedicated campus. Multiple units, internal roads, own gate.' },
];
