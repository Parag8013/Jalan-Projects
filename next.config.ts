import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The dev badge sits over the pinned scenes' lower-left corner.
  devIndicators: false,
  images: {
    // ImageKit handles transforms + CDN; next/image keeps layout stability.
    loader: 'custom',
    loaderFile: './lib/imagekit-loader.ts',
    remotePatterns: [{ protocol: 'https', hostname: 'ik.imagekit.io' }],
  },
};

export default nextConfig;
