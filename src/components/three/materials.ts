/**
 * Physically-believable industrial material presets.
 * Used as props spreads on <meshStandardMaterial /> so R3F manages disposal.
 */

export const MAT = {
  brushedSteel: { color: '#AEB6C6', metalness: 0.62, roughness: 0.38 },
  stainless: { color: '#D8DDE8', metalness: 0.72, roughness: 0.24 },
  galva: { color: '#B6BEC8', metalness: 0.5, roughness: 0.52 },
  paintedNavy: { color: '#1D3070', metalness: 0.3, roughness: 0.48 },
  paintedDark: { color: '#0F1B40', metalness: 0.35, roughness: 0.5 },
  paintedOrange: { color: '#F57A1C', metalness: 0.32, roughness: 0.4 },
  paintedRed: { color: '#C4331F', metalness: 0.32, roughness: 0.42 },
  copper: { color: '#C77B4A', metalness: 0.9, roughness: 0.34 },
  rubber: { color: '#22262E', metalness: 0.0, roughness: 0.92 },
  concrete: { color: '#8A8F99', metalness: 0.02, roughness: 0.95 },
  slab: { color: '#39415A', metalness: 0.05, roughness: 0.9 },
  aluJacket: { color: '#D2D8E2', metalness: 0.58, roughness: 0.3 },
  rockwool: { color: '#D9C98F', metalness: 0.0, roughness: 1.0 },
  pvcDark: { color: '#3E4A66', metalness: 0.05, roughness: 0.7 },
  pvcGrey: { color: '#7C87A6', metalness: 0.05, roughness: 0.62 },
  /* --- building fabric --- */
  concreteWall: { color: '#6E7480', metalness: 0.02, roughness: 0.94 },
  screed: { color: '#5C6270', metalness: 0.03, roughness: 0.88 },
  steelColumn: { color: '#4E5666', metalness: 0.55, roughness: 0.5 },
  cladding: { color: '#8E96A4', metalness: 0.45, roughness: 0.55 },
  copperPipe: { color: '#B0703F', metalness: 0.85, roughness: 0.35 },
} as const;

export const COLORS = {
  navy: '#14235A',
  navyDeep: '#0C1638',
  orange: '#F57A1C',
  amber: '#FF9440',
  waterRaw: '#8A6B3F',
  waterMid: '#4E7F98',
  waterClean: '#39B7D8',
  airCool: '#4FC3F7',
  airWarm: '#FF9440',
  fire: '#E23D28',
  hot: '#FF5A2A',
  cold: '#4FC3F7',
  ok: '#2FBF71',
  steam: '#DDE3EE',
} as const;
