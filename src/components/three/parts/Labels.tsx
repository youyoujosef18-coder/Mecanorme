'use client';

import React from 'react';
import { Html, Line } from '@react-three/drei';
import { useQuality } from '../quality';

/**
 * Technical callout label with a leader line — mono chip anchored to a 3D point.
 */
export function TechnicalLabel({
  anchor,
  offset = [0.6, 0.6, 0],
  text,
  sub,
  accent = '#F57A1C',
  visible = true,
}: {
  anchor: [number, number, number];
  offset?: [number, number, number];
  text: string;
  sub?: string;
  accent?: string;
  visible?: boolean;
}) {
  // on small screens the chips are pulled closer to their anchor and set smaller,
  // so callouts stay inside the canvas instead of bleeding past its edges
  const compact = useQuality() === 'low';
  const k = compact ? 0.5 : 1;
  const end: [number, number, number] = [
    anchor[0] + offset[0] * k,
    anchor[1] + offset[1] * k,
    anchor[2] + offset[2] * k,
  ];
  if (!visible || !text) return null;
  return (
    <group>
      <Line points={[anchor, end]} color={accent} lineWidth={1} transparent opacity={0.75} />
      <mesh position={anchor}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <Html position={end} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            // compact chips grow back toward the model so they never clear the canvas edge
            transform: compact
              ? `translate(${offset[0] < 0 ? '50%' : '-50%'}, -50%)`
              : 'translateY(-50%)',
            background: 'rgba(8,15,38,0.88)',
            border: '1px solid rgba(36,53,110,0.9)',
            borderLeft: `3px solid ${accent}`,
            padding: compact ? '3px 6px' : '5px 9px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: compact ? 8 : 10,
              letterSpacing: compact ? '0.08em' : '0.14em',
              color: '#F4F5F8',
              textTransform: 'uppercase',
            }}
          >
            {text}
          </div>
          {sub && (
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: compact ? 7 : 9,
                letterSpacing: '0.1em',
                color: accent,
                marginTop: 2,
              }}
            >
              {sub}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
