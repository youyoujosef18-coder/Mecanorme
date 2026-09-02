import type { ServiceId } from '@/lib/i18n/dict';

export type MetricSim = { base: number; jitter: number; decimals: number };

export type ServiceDef = {
  id: ServiceId;
  index: string;
  /** section accent used inside the demo (brand stays dominant) */
  accent: string;
  accentSoft: string;
  /** metric simulation configs matching dict metrics order */
  sims: MetricSim[];
};

export const SERVICES: ServiceDef[] = [
  {
    id: 'piping',
    index: '01',
    accent: '#F57A1C',
    accentSoft: 'rgba(245,122,28,0.14)',
    sims: [
      { base: 82, jitter: 4, decimals: 0 },
      { base: 4.6, jitter: 0.3, decimals: 1 },
      { base: 21.4, jitter: 0.6, decimals: 1 },
    ],
  },
  {
    id: 'hvac',
    index: '02',
    accent: '#4FC3F7',
    accentSoft: 'rgba(79,195,247,0.14)',
    sims: [
      { base: 12400, jitter: 350, decimals: 0 },
      { base: 16.5, jitter: 0.4, decimals: 1 },
      { base: 24.8, jitter: 0.5, decimals: 1 },
    ],
  },
  {
    id: 'water',
    index: '03',
    accent: '#39B7D8',
    accentSoft: 'rgba(57,183,216,0.14)',
    sims: [
      { base: 45, jitter: 2.5, decimals: 0 },
      { base: 12, jitter: 1.6, decimals: 0 },
      { base: 18, jitter: 1.2, decimals: 0 },
    ],
  },
  {
    id: 'fire',
    index: '04',
    accent: '#E23D28',
    accentSoft: 'rgba(226,61,40,0.14)',
    sims: [
      { base: 8.2, jitter: 0.35, decimals: 1 },
      { base: 120, jitter: 6, decimals: 0 },
      { base: 96, jitter: 1.5, decimals: 0 },
    ],
  },
  {
    id: 'insulation',
    index: '05',
    accent: '#FF9440',
    accentSoft: 'rgba(255,148,64,0.14)',
    sims: [
      { base: 165, jitter: 3, decimals: 0 },
      { base: 38, jitter: 1.4, decimals: 0 },
      { base: 78, jitter: 1.2, decimals: 0 },
    ],
  },
  {
    id: 'plumbing',
    index: '06',
    accent: '#7EA0F5',
    accentSoft: 'rgba(126,160,245,0.14)',
    sims: [
      { base: 3.2, jitter: 0.25, decimals: 1 },
      { base: 55, jitter: 1, decimals: 0 },
      { base: 6.8, jitter: 0.5, decimals: 1 },
    ],
  },
];

export const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<
  ServiceId,
  ServiceDef
>;
