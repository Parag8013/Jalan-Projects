import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import SmoothScroll from '@/components/motion/SmoothScroll';
import './globals.css';

/**
 * Fraunces carries the personality. It is a high-contrast serif with optical
 * size, SOFT and WONK axes — the flared, slightly idiosyncratic cut is what
 * keeps an elegant serif from reading as stock luxury-realtor Playfair.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jalan Projects — Industrial land and infrastructure, West Bengal',
  description:
    'Land of any size, anywhere in West Bengal. Three industrial parks in Howrah, plus build-to-suit warehouses, factory sheds and logistics facilities.',
};

export const viewport: Viewport = {
  themeColor: '#fbf9f7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <div className="drafting-grid" aria-hidden="true" />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
