import React from 'react';

/**
 * MECANORME logotype rebuilt as pure vector geometry from the original logo:
 * — squared engineered glyphs, cap height 100
 * — "MECA" in navy, "NORME" in orange
 * — speed slits cut through the first M and E
 * — orange triangle counter inside the A
 * — two-tone divider rule + tagline
 */

const NAVY = '#14235A';
const ORANGE = '#F57A1C';

type GlyphProps = { x: number; fill: string };

const M = ({ x, fill }: GlyphProps) => (
  <path transform={`translate(${x},0)`} fill={fill} d="M0,0 H26 L44,30 L62,0 H88 V100 H66 V34 L44,68 L22,34 V100 H0 Z" />
);
const E = ({ x, fill }: GlyphProps) => (
  <path transform={`translate(${x},0)`} fill={fill} d="M0,0 H64 V22 H22 V39 H58 V61 H22 V78 H64 V100 H0 Z" />
);
const C = ({ x, fill }: GlyphProps) => (
  <path transform={`translate(${x},0)`} fill={fill} d="M0,0 H72 V22 H22 V78 H72 V100 H0 Z" />
);
const A = ({ x, fill, triangle = ORANGE }: GlyphProps & { triangle?: string }) => (
  <g transform={`translate(${x},0)`}>
    <path fill={fill} d="M33,0 H55 L88,100 H66 L44,30 L22,100 H0 Z" />
    <path fill={triangle} d="M44,42 L60,90 H28 Z" />
  </g>
);
const N = ({ x, fill }: GlyphProps) => (
  <path transform={`translate(${x},0)`} fill={fill} d="M0,0 H24 L58,58 V0 H80 V100 H56 L22,42 V100 H0 Z" />
);
const O = ({ x, fill }: GlyphProps) => (
  <path
    transform={`translate(${x},0)`}
    fill={fill}
    fillRule="evenodd"
    d="M0,0 H80 V100 H0 Z M22,22 H58 V78 H22 Z"
  />
);
const R = ({ x, fill }: GlyphProps) => (
  <path
    transform={`translate(${x},0)`}
    fill={fill}
    fillRule="evenodd"
    d="M0,0 H76 V58 H46 L76,100 H50 L24,58 H22 V100 H0 Z M22,20 H54 V40 H22 Z"
  />
);

function Wordmark({ dark }: { dark?: boolean }) {
  const navy = dark ? '#F4F5F8' : NAVY;
  return (
    <g>
      <defs>
        <mask id="mnr-slits" maskUnits="userSpaceOnUse" x="-10" y="0" width="820" height="100">
          <rect x="-10" y="0" width="820" height="100" fill="#fff" />
          {/* speed slits through M and E of MECA */}
          <rect x="-10" y="26" width="58" height="8" fill="#000" />
          <rect x="-10" y="58" width="36" height="8" fill="#000" />
          <rect x="92" y="26" width="44" height="8" fill="#000" />
          <rect x="92" y="58" width="36" height="8" fill="#000" />
        </mask>
      </defs>
      <g mask="url(#mnr-slits)">
        <M x={0} fill={navy} />
        <E x={100} fill={navy} />
        <C x={176} fill={navy} />
        <A x={260} fill={navy} />
        <N x={360} fill={ORANGE} />
        <O x={452} fill={ORANGE} />
        <R x={544} fill={ORANGE} />
        <M x={632} fill={ORANGE} />
        <E x={732} fill={ORANGE} />
      </g>
    </g>
  );
}

export function Logo({
  variant = 'lockup',
  dark = false,
  className,
  title = 'MECANORME — Ingénierie & Construction',
}: {
  variant?: 'lockup' | 'word' | 'mark';
  dark?: boolean;
  className?: string;
  title?: string;
}) {
  const navy = dark ? '#F4F5F8' : NAVY;

  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
        <title>{title}</title>
        <path fill={dark ? '#F4F5F8' : NAVY} d="M39,10 H61 L94,90 H72 L50,34 L28,90 H6 Z" />
        <path fill={ORANGE} d="M50,48 L64,84 H36 Z" />
      </svg>
    );
  }

  if (variant === 'word') {
    return (
      <svg viewBox="-2 -2 800 104" className={className} role="img" aria-label={title}>
        <title>{title}</title>
        <Wordmark dark={dark} />
      </svg>
    );
  }

  return (
    <svg viewBox="-2 -2 800 178" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <Wordmark dark={dark} />
      {/* two-tone divider */}
      <rect x="2" y="126" width="384" height="7" fill={navy} />
      <rect x="410" y="126" width="384" height="7" fill={ORANGE} />
      {/* tagline */}
      <rect x="34" y="158" width="36" height="4" fill={navy} />
      <text
        x="398"
        y="167"
        textAnchor="middle"
        fill={navy}
        style={{
          font: '600 25px "Archivo Variable", Archivo, system-ui, sans-serif',
          letterSpacing: '0.34em',
        }}
      >
        INGÉNIERIE &amp; CONSTRUCTION
      </text>
      <rect x="726" y="158" width="36" height="4" fill={ORANGE} />
    </svg>
  );
}

export default Logo;
