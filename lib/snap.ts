/**
 * Registry of scroll positions the page is allowed to come to rest on.
 *
 * Two different behaviours, because a page that treats a film and a column of
 * prose the same way gets one of them wrong.
 *
 * **Step groups** are the pinned scenes. Inside one, scrolling is committed:
 * any gesture hands the page to the next point in that direction and the
 * journey there cannot be interrupted. One flick, one construction stage. The
 * group carries its own bounds so the engine knows when the visitor has left
 * and normal scrolling resumes.
 *
 * **Settle points** are section tops. These only pull when the visitor has
 * already stopped within a short reach of one, so a long section can still be
 * read a screenful at a time. Magnetic alignment, not hijacking.
 *
 * Providers are functions rather than values because every one of these
 * positions is derived from a ScrollTrigger whose `start` and `end` move on
 * every refresh — a resize, a font swap, an image landing. Reading them at the
 * moment of the gesture means there is nothing to invalidate.
 */

export type StepGroup = {
  /** Absolute scroll positions, ascending. */
  points: number[];
  /** Bounds of the committed region. */
  from: number;
  to: number;
};

type StepProvider = () => StepGroup | null;

const stepProviders = new Set<StepProvider>();

/** Returns its own unregister function. Call it in the effect's cleanup. */
export function registerStepGroup(provider: StepProvider): () => void {
  stepProviders.add(provider);
  return () => {
    stepProviders.delete(provider);
  };
}

/**
 * Every step group covering `y`, in registration order.
 *
 * `lead` lets a group claim the approach as well as its own range, so the
 * first point of a scene is a stop rather than something the visitor is
 * already past by the time the group takes over.
 *
 * More than one can match at a time, and that case is the interesting one.
 * Two scenes that sit directly against each other overlap by exactly `lead`,
 * and the outgoing scene — which has no further points to offer — would
 * otherwise swallow the gesture and leave the next scene's opening frame
 * unreachable. The caller walks the list and takes the first group that
 * actually has somewhere to send the visitor.
 */
export function stepGroupsAt(y: number, lead: number): StepGroup[] {
  const out: StepGroup[] = [];
  for (const provider of stepProviders) {
    const group = provider();
    if (!group || group.points.length < 2) continue;
    if (y >= group.from - lead && y <= group.to) {
      out.push({ ...group, points: [...group.points].sort((a, b) => a - b) });
    }
  }
  return out;
}

/** The closest point in the group, whichever side of `y` it falls. */
export function nearestStep(group: StepGroup, y: number): number {
  return group.points.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
}

/** The next point beyond `y` travelling in `dir`, or null at the group's edge. */
export function nextStep(group: StepGroup, y: number, dir: 1 | -1): number | null {
  // Wide enough that arriving at a point does not immediately qualify as
  // standing before the next one, narrow enough to never skip a stage.
  const eps = 6;

  if (dir > 0) {
    for (const p of group.points) if (p > y + eps) return p;
    return null;
  }
  for (let i = group.points.length - 1; i >= 0; i--) {
    if (group.points[i] < y - eps) return group.points[i];
  }
  return null;
}

/**
 * Section tops.
 *
 * Read from the DOM at rest rather than cached, because it costs one layout
 * read a few times a minute and removes any question of the cache being stale
 * after a refresh.
 */
export function settlePoints(): number[] {
  const out: number[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('section[id]')) {
    out.push(Math.round(el.getBoundingClientRect().top + window.scrollY));
  }
  return out;
}

/**
 * Turn caption cue points into resting points.
 *
 * A caption's cue is where it *begins* fading in, so a scene that rests
 * exactly on one lands on the single worst frame of the whole sequence: the
 * incoming caption still at zero opacity, the outgoing one half gone, nothing
 * on screen readable. `settle` carries the rest past the end of the fade.
 *
 * Set it from the scene's own longest entrance tween plus a little. It costs a
 * few frames of footage, which is a fair trade for every stop being composed.
 */
export function restPoints(cues: readonly number[], settle: number): number[] {
  return cues.map((c) => Math.min(1, c + settle));
}
