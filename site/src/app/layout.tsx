import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { EMAIL, GITHUB, SITE_URL } from '@/lib/content';
import './globals.css';

const display = Big_Shoulders({ subsets: ['latin'], axes: ['opsz'], variable: '--font-display', display: 'swap', adjustFontFallback: false });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

const title = 'Parallel Hours — Motion is a material';
const description = 'Parallel Hours is an independent studio for interactive worlds: WebGL, motion, sound and code.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Parallel Hours',
    title,
    description: 'An independent studio for interactive worlds.',
  },
  twitter: { card: 'summary_large_image', title, description: 'An independent studio for interactive worlds.' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0C',
  colorScheme: 'dark',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Parallel Hours',
  url: SITE_URL,
  email: EMAIL,
  description,
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  sameAs: [GITHUB],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
