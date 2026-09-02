'use client';

import React, { useMemo } from 'react';
import { PipeRun, usePipeCurve, type Vec3 } from '../parts/PipeRun';
import { LiquidFlow } from '../parts/FlowParticles';
import { Pump, Tank, Gauge } from '../parts/Equipment';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';

/**
 * Three-storey building slice: cold riser + branches, DHW loop from calorifier,
 * drainage stack, booster set at the base.
 * Modes: 0 SUPPLY · 1 HOT WATER · 2 DRAINAGE · 3 BOOSTER
 */
export default function PlumbingScene({ mode, labels }: { mode: number; labels: string[] }) {
  const floors = [-1.75, -0.4, 0.95];
  const boosting = mode === 3;
  const coldOn = mode === 0 || mode === 3;
  const hotOn = mode === 1;
  const drainOn = mode === 2;

  const coldMat = { color: '#2F6FD6', metalness: 0.35, roughness: 0.4 };
  const hotMat = { color: '#D96410', metalness: 0.35, roughness: 0.4 };
  const drainMat = MAT.pvcDark;

  const coldRiser: Vec3[] = useMemo(
    () => [
      [-2.15, -1.6, 0.75],
      [-1.55, -1.6, 0.75],
      [-1.55, 1.75, 0.75],
    ],
    []
  );
  const coldBranches: Vec3[][] = useMemo(
    () =>
      floors.map((y) => [
        [-1.55, y + 0.55, 0.75],
        [0.4, y + 0.55, 0.75],
        [1.5, y + 0.55, 0.75],
      ]) as Vec3[][],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const hotLoop: Vec3[] = useMemo(
    () => [
      [0.55, -1.15, 0.45],
      [-1.25, -1.15, 0.45],
      [-1.25, 1.65, 0.45],
      [1.3, 1.65, 0.45],
      [1.3, -0.6, 0.45],
    ],
    []
  );
  const drainStack: Vec3[] = useMemo(
    () => [
      [2.25, 1.55, -0.55],
      [2.25, -1.95, -0.55],
    ],
    []
  );
  const drainBranches: Vec3[][] = useMemo(
    () =>
      floors.map((y) => [
        [0.7, y + 0.42, -0.55],
        [2.25, y + 0.3, -0.55],
      ]) as Vec3[][],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const coldCurve = usePipeCurve(coldRiser);
  const coldB = [usePipeCurve(coldBranches[0]), usePipeCurve(coldBranches[1]), usePipeCurve(coldBranches[2])];
  const hotCurve = usePipeCurve(hotLoop);
  const drainCurve = usePipeCurve(drainStack);
  const drainB = [usePipeCurve(drainBranches[0]), usePipeCurve(drainBranches[1]), usePipeCurve(drainBranches[2])];

  return (
    <group>
      {/* building slice: slabs + back wall + columns */}
      <mesh position={[0.3, -0.05, -1.15]}>
        <boxGeometry args={[4.6, 3.9, 0.1]} />
        <meshStandardMaterial color="#232C4C" roughness={0.9} />
      </mesh>
      {floors.map((y) => (
        <mesh key={y} position={[0.3, y, -0.15]}>
          <boxGeometry args={[4.6, 0.14, 2.1]} />
          <meshStandardMaterial {...MAT.slab} />
        </mesh>
      ))}
      {[-1.85, 2.45].map((x) => (
        <mesh key={x} position={[x, -0.05, -0.95]}>
          <boxGeometry args={[0.18, 3.9, 0.18]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>
      ))}
      {/* fixtures per floor (schematic sanitary blocks) */}
      {floors.map((y) => (
        <group key={y}>
          <mesh position={[0.4, y + 0.26, 0.35]}>
            <boxGeometry args={[0.55, 0.36, 0.4]} />
            <meshStandardMaterial color="#E9EDF5" metalness={0.1} roughness={0.4} />
          </mesh>
          <mesh position={[1.5, y + 0.23, 0.35]}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#DDE3EE" metalness={0.1} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* booster set */}
      <Pump position={[-2.6, -1.6, 0.9]} running={boosting || coldOn} scale={0.72} color={MAT.paintedNavy.color} />
      <Pump position={[-2.6, -1.6, 0.3]} running={boosting} scale={0.72} color={MAT.paintedNavy.color} />
      <Tank position={[-3.3, -1.25, 0.6]} radius={0.22} height={0.6} mat={MAT.paintedOrange} legs={false} />
      <Gauge position={[-2.15, -1.15, 0.75]} value={boosting ? 0.85 : 0.5} scale={0.85} />

      {/* calorifier (DHW) */}
      <Tank
        position={[0.85, -1.15, 0.45]}
        radius={0.3}
        height={0.8}
        mat={{ ...MAT.stainless, emissive: hotOn ? '#D96410' : '#000000', emissiveIntensity: hotOn ? 0.35 : 0 }}
        legs={false}
      />

      {/* networks */}
      <PipeRun points={coldRiser} radius={0.055} mat={coldMat} />
      {coldBranches.map((b, i) => (
        <PipeRun key={i} points={b} radius={0.04} mat={coldMat} />
      ))}
      <PipeRun points={hotLoop} radius={0.045} mat={hotMat} />
      <PipeRun points={drainStack} radius={0.085} mat={drainMat} />
      {drainBranches.map((b, i) => (
        <PipeRun key={i} points={b} radius={0.05} mat={drainMat} />
      ))}

      {/* flows */}
      <LiquidFlow curve={coldCurve} radius={0.055} color={COLORS.cold} active={coldOn} speed={boosting ? 0.36 : 0.22} />
      {coldB.map((c, i) => (
        <LiquidFlow key={i} curve={c} radius={0.04} color={COLORS.cold} active={coldOn} speed={0.24} />
      ))}
      <LiquidFlow curve={hotCurve} radius={0.045} color={COLORS.airWarm} active={hotOn} speed={0.22} />
      <LiquidFlow curve={drainCurve} radius={0.085} color="#93A2C4" active={drainOn} speed={0.34} />
      {drainB.map((c, i) => (
        <LiquidFlow key={i} curve={c} radius={0.05} color="#93A2C4" active={drainOn} speed={0.3} />
      ))}

      {/* callouts */}
      <TechnicalLabel anchor={[-1.55, 1.15, 0.75]} offset={[-0.55, 0.6, 0.3]} text={labels[0]} accent={coldOn ? COLORS.cold : '#7EA0F5'} visible={mode !== 1} />
      <TechnicalLabel anchor={[0.85, -0.75, 0.45]} offset={[0.35, 0.5, 0.55]} text={labels[1]} accent={hotOn ? COLORS.amber : '#7EA0F5'} visible={mode === 1} />
      <TechnicalLabel anchor={[2.25, 0.8, -0.55]} offset={[0.45, 0.55, 0.35]} text={labels[2]} accent="#7EA0F5" visible={mode === 2} />
      <TechnicalLabel anchor={[-2.6, -1.35, 0.6]} offset={[-0.3, 0.85, 0.6]} text={labels[3]} accent={boosting ? COLORS.orange : '#7EA0F5'} visible={mode === 3 || mode === 0} />
    </group>
  );
}
