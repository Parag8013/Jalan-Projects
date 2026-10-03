import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Prata } from 'next/font/google';
import ScrollRoot from '@/components/motion/ScrollRoot';
import './globals.css';

/**
 * Prata is the display face for every heading and name. It replaced Fraunces,
 * whose capital J drops below the baseline and reads as a misspelling in
 * "BMJ" and "Jalan". Prata ships one weight and no italic.
 */
const prata = Prata({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-prata',
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
      className={`${prata.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <div className="drafting-grid" aria-hidden="true" />
        <ScrollRoot>{children}</ScrollRoot>
      </body>
    </html>
  );
}
