'use client';

import { createContext, useContext } from 'react';

export type Quality = 'high' | 'low';

export const QualityContext = createContext<Quality>('high');

export function useQuality() {
  return useContext(QualityContext);
}

/** scale particle counts / segment detail by quality */
export function useDetail() {
  const q = useQuality();
  return {
    q,
    particles: (n: number) => (q === 'high' ? n : Math.max(8, Math.round(n * 0.45))),
    segments: (n: number) => (q === 'high' ? n : Math.max(8, Math.round(n * 0.6))),
    shadows: q === 'high',
  };
}
