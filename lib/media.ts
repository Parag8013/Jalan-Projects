/**
 * Cache-busting stamp for everything under `/media`.
 *
 * `vercel.json` caches `/media/*` for 30 days, which is correct for 600-odd
 * frames that never change — but a long cache is only safe on a URL that
 * changes when the bytes behind it do. Without that stamp, two things go
 * wrong, and both of them have teeth:
 *
 * **Re-generating footage strands returning visitors.** `FLOW-PROMPTS.md`
 * actively instructs you to overwrite these files. Every browser that has been
 * here in the last month keeps serving the old frames from disk — and worse,
 * serves a *mix*, because individual entries expire at different times. A
 * half-old, half-new scrub is a far uglier failure than a missing one.
 *
 * **A 404 is cached just as eagerly as a hit.** That is not hypothetical: the
 * hero's 210 frames were briefly missing from a deploy, and the same header
 * that caches a frame for 30 days cached its absence for 30 days. Restoring
 * the files fixed the origin and changed nothing for anybody who had already
 * visited.
 *
 * **Bump this whenever anything in `public/media` changes.** It is one
 * character, and it is the only thing that makes the 30-day cache safe.
 */
export const MEDIA_VERSION = '4';

/**
 * Stamp a `/media` path so the CDN and the browser treat it as new content.
 *
 * A query string is enough — it forms part of the cache key everywhere that
 * matters, and `vercel.json` matches on the path, so the caching rule still
 * applies.
 */
export function media(path: string): string {
  return `${path}?v=${MEDIA_VERSION}`;
}
