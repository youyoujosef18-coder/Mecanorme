import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/archivo';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://mecanorme.vercel.app'),
  title: 'MECANORME — Ingénierie & Construction | Tuyauterie, CVC, Traitement des eaux',
  description:
    "MECANORME conçoit, installe et met en service vos systèmes mécaniques : tuyauterie industrielle, CVC, traitement des eaux, protection incendie, calorifugeage et plomberie. Alger, Algérie.",
  keywords: [
    'ingénierie',
    'construction',
    'tuyauterie industrielle',
    'CVC',
    'HVAC',
    'traitement des eaux',
    'protection incendie',
    'calorifugeage',
    'plomberie',
    'Alger',
    'Algérie',
  ],
  openGraph: {
    title: 'MECANORME — Ingénierie & Construction',
    description:
      "Systèmes mécaniques industriels : tuyauterie, CVC, traitement des eaux, protection incendie, calorifugeage, plomberie. Alger.",
    type: 'website',
    locale: 'fr_DZ',
    alternateLocale: 'en_US',
    siteName: 'MECANORME',
  },
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0C1638',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'GeneralContractor',
  name: 'MECANORME',
  slogan: 'Ingénierie & Construction',
  description:
    "Entreprise d'ingénierie et de construction : tuyauterie industrielle, CVC, traitement des eaux, protection incendie, calorifugeage et plomberie.",
  telephone: '+213770258744',
  email: 'hamadache.salaheddine@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '35 Rue Mohamed Garidi',
    addressLocality: 'Kouba',
    addressRegion: 'Alger',
    addressCountry: 'DZ',
  },
  areaServed: 'DZ',
  openingHours: 'Sa-Th 08:00-16:00',
  knowsAbout: [
    'Tuyauterie industrielle',
    'CVC',
    'Traitement des eaux',
    'Protection incendie',
    'Calorifugeage',
    'Plomberie',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
