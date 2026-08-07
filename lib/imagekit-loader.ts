'use client';

type LoaderArgs = { src: string; width: number; quality?: number };

const ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT ?? '';

/**
 * Custom next/image loader for ImageKit.
 *
 * Keeps next/image's sizes/priority/aspect-ratio handling (so CLS stays near
 * zero) while ImageKit does format negotiation and resizing at the edge.
 */
export default function imagekitLoader({ src, width, quality }: LoaderArgs): string {
  const params = [`w-${width}`, `q-${quality ?? 75}`, 'f-auto', 'c-at_max'];

  // Absolute URLs pass through with transforms appended as a query param.
  if (src.startsWith('http')) {
    const url = new URL(src);
    url.searchParams.set('tr', params.join(','));
    return url.toString();
  }

  const path = src.startsWith('/') ? src : `/${src}`;
  return `${ENDPOINT}/tr:${params.join(',')}${path}`;
}
