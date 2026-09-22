import type { MetadataRoute } from 'next';

/** Lets Chrome on Android install the site with the brand's icon and night-navy chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MECANORME — Ingénierie & Construction',
    short_name: 'MECANORME',
    description:
      'Tuyauterie industrielle, CVC, traitement des eaux, protection incendie, calorifugeage et plomberie. Alger, Algérie.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080F26',
    theme_color: '#080F26',
    lang: 'fr',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
