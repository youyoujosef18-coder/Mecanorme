'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PipeRun, usePipeCurve, type Vec3 } from '../parts/PipeRun';
import { LiquidFlow } from '../parts/FlowParticles';
import { Pump, Tank, FilterVessel } from '../parts/Equipment';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';

/**
 * Complete treatment train: raw tank -> pump -> media filters -> RO rack -> UV -> clean tank.
 * Modes: 0 RAW WATER · 1 FILTRATION · 2 RO MEMBRANE · 3 CLEAN WATER
 */
export default function WaterScene({ mode, labels }: { mode: number; labels: string[] }) {
  const line: Vec3[] = useMemo(
    () => [
      [-3.45, -0.15, 0],
      [-3.45, 0.75, 0],
      [-1.35, 0.75, 0],
      [-1.35, -0.1, 0],
      [-0.35, -0.1, 0],
      [-0.35, 0.75, 0],
      [0.6, 0.75, 0],
      [0.6, -0.35, 0.3],
      [1.95, -0.35, 0.3],
      [1.95, 0.55, 0],
      [2.6, 0.55, 0],
      [3.35, 0.55, 0],
      [3.35, -0.1, 0],
    ],
    []
  );
  const waste: Vec3[] = useMemo(
    () => [
      [1.6, -0.55, 0.3],
      [1.6, -1.5, 0.7],
      [2.2, -1.72, 0.9],
    ],
    []
  );
  const curve = usePipeCurve(line);
  const wasteCurve = usePipeCurve(waste);

  const stops = [
    { t: 0, color: COLORS.waterRaw },
    { t: 0.3, color: COLORS.waterRaw },
    { t: 0.5, color: COLORS.waterMid },
    { t: 0.75, color: COLORS.waterClean },
    { t: 1, color: COLORS.waterClean },
  ];

  const uvOn = mode >= 2;

  return (
    <group>
      {/* raw water tank */}
      <Tank position={[-3.45, -0.95, 0]} radius={0.48} height={1.35} mat={{ color: '#4A5578', metalness: 0.5, roughness: 0.5 }} />
      {/* transfer pump */}
      <Pump position={[-2.45, -1.55, 0.55]} running scale={0.9} color={MAT.paintedNavy.color} />
      {/* media filters */}
      <FilterVessel position={[-1.35, -0.85, 0]} color="#2F6F8F" highlighted={mode === 1} />
      <FilterVessel position={[-0.35, -0.85, 0]} color="#33788F" highlighted={mode === 1} />
      {/* RO rack */}
      <group position={[1.28, -0.75, 0.3]}>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[1.5, 0.08, 0.7]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {[-0.62, 0.62].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.07, 1.0, 0.07]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
        ))}
        {[0.42, 0.12, -0.18].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 1.28, 18]} />
            <meshStandardMaterial
              color="#E9EDF5"
              metalness={0.15}
              roughness={0.35}
              emissive={mode === 2 ? '#39B7D8' : '#000000'}
              emissiveIntensity={mode === 2 ? 0.3 : 0}
            />
          </mesh>
        ))}
      </group>
      {/* UV sterilizer */}
      <group position={[2.28, 0.55, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.62, 16]} />
          <meshStandardMaterial {...MAT.stainless} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.66, 10]} />
          <meshStandardMaterial
            color="#B9A7FF"
            emissive="#7C5CFF"
            emissiveIntensity={uvOn ? 1.6 : 0.1}
            toneMapped={false}
          />
        </mesh>
        {uvOn && <pointLight color="#8F6CFF" intensity={1.1} distance={2.4} />}
      </group>
      {/* clean water tank */}
      <Tank
        position={[3.35, -0.85, 0]}
        radius={0.44}
        height={1.15}
        mat={{
          ...MAT.stainless,
          emissive: mode === 3 ? '#39B7D8' : '#000000',
          emissiveIntensity: mode === 3 ? 0.22 : 0,
        }}
      />

      {/* process line */}
      <PipeRun points={line} radius={0.075} mat={MAT.stainless} />
      <PipeRun points={waste} radius={0.05} mat={MAT.pvcDark} />
      {/* floor drain marker */}
      <mesh position={[2.2, -1.78, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 20]} />
        <meshStandardMaterial color="#2A3352" roughness={0.9} />
      </mesh>

      {/* flow — color grades from raw to treated */}
      <LiquidFlow curve={curve} radius={0.075} colorStops={stops} active speed={0.15} />
      <LiquidFlow curve={wasteCurve} radius={0.05} color="#9A8354" active={mode >= 2} speed={0.24} opacity={0.8} />

      {/* callouts */}
      <TechnicalLabel anchor={[-3.45, -0.2, 0]} offset={[-0.1, 1.35, 0.3]} text={labels[0]} accent={mode === 0 ? COLORS.orange : '#7EA0F5'} visible />
      <TechnicalLabel anchor={[-0.85, -0.5, 0.15]} offset={[-0.15, 1.75, 0.55]} text={labels[1]} accent={mode === 1 ? COLORS.orange : '#7EA0F5'} visible={mode === 1} />
      <TechnicalLabel anchor={[1.28, -0.05, 0.3]} offset={[0.3, 0.9, 0.4]} text={labels[2]} accent={mode === 2 ? COLORS.orange : '#7EA0F5'} visible={mode === 2} />
      <TechnicalLabel anchor={[3.35, -0.15, 0]} offset={[0.15, 1.0, 0.35]} text={labels[3]} accent={mode === 3 ? COLORS.orange : '#7EA0F5'} visible={mode === 3 || mode === 0} />
    </group>
  );
}
