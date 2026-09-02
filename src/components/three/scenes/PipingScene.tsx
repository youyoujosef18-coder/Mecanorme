'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PipeRun, FluidCore, usePipeCurve, type Vec3 } from '../parts/PipeRun';
import { LiquidFlow } from '../parts/FlowParticles';
import { Valve, Pump, Tank, Gauge } from '../parts/Equipment';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';

/**
 * Industrial piping rack: pump -> riser -> main line with isolation valve -> vessel.
 * Modes: 0 FLOW · 1 VALVES · 2 PRESSURE · 3 CUTAWAY
 */
export default function PipingScene({ mode, labels }: { mode: number; labels: string[] }) {
  const upstream: Vec3[] = useMemo(
    () => [
      [-2.72, -1.28, 0.6],
      [-2.72, 0.6, 0.6],
      [-0.38, 0.6, 0.6],
    ],
    []
  );
  const downstream: Vec3[] = useMemo(
    () => [
      [-0.02, 0.6, 0.6],
      [2.6, 0.6, 0.6],
      [2.6, 0.6, -0.75],
      [2.6, -0.62, -0.75],
    ],
    []
  );
  const utility: Vec3[] = useMemo(
    () => [
      [-3.25, -1.5, -1.25],
      [-3.25, 1.35, -1.25],
      [3.05, 1.35, -1.25],
      [3.05, -0.4, -1.25],
    ],
    []
  );

  const upCurve = usePipeCurve(upstream);
  const downCurve = usePipeCurve(downstream);
  const utilCurve = usePipeCurve(utility);

  const cutaway = mode === 3;
  const valveOpen = mode === 1 ? 0 : 1;
  const flowing = mode !== 1;
  const gaugeValue = mode === 1 ? 0.92 : mode === 2 ? 0.78 : 0.55;
  const speed = mode === 2 ? 0.2 : 0.12;

  const pulse = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (pulse.current) {
      pulse.current.intensity =
        mode === 2 ? 0.9 + Math.sin(state.clock.elapsedTime * 5) * 0.5 : 0;
    }
  });

  return (
    <group>
      {/* support rack — columns carrying both pipe levels */}
      {[-1.6, 0.7, 2.25].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.33, -0.32]}>
            <boxGeometry args={[0.1, 3.14, 0.1]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
          {/* arm under the process line */}
          <mesh position={[x, 0.44, 0.14]}>
            <boxGeometry args={[0.1, 0.08, 1.05]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
          {/* arm under the utility line */}
          <mesh position={[x, 1.24, -0.78]}>
            <boxGeometry args={[0.1, 0.08, 1.02]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
          {/* base plate */}
          <mesh position={[x, -1.88, -0.32]}>
            <boxGeometry args={[0.28, 0.05, 0.28]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
        </group>
      ))}

      {/* main process line */}
      <PipeRun points={upstream} radius={0.115} mat={MAT.brushedSteel} flangeEvery={1} transparent={cutaway} opacity={0.24} />
      <PipeRun points={downstream} radius={0.115} mat={MAT.brushedSteel} flangeEvery={1} transparent={cutaway} opacity={0.24} />
      {cutaway && <FluidCore points={upstream} radius={0.07} color={COLORS.orange} />}
      {cutaway && <FluidCore points={downstream} radius={0.07} color={COLORS.orange} />}

      {/* utility line (stainless, thinner) */}
      <PipeRun points={utility} radius={0.065} mat={MAT.stainless} />

      {/* equipment */}
      <Pump position={[-3.05, -1.55, 0.6]} running={flowing} />
      <Valve position={[-0.2, 0.6, 0.6]} open={valveOpen} />
      <Gauge position={[0.62, 0.95, 0.6]} value={gaugeValue} />
      <Tank position={[2.6, -1.05, -0.75]} radius={0.42} height={1.1} horizontal mat={MAT.brushedSteel} />

      {/* flow */}
      <LiquidFlow curve={upCurve} radius={0.115} color={COLORS.orange} active speed={speed * 1.9} />
      <LiquidFlow curve={downCurve} radius={0.115} color={COLORS.orange} active={flowing} speed={speed * 1.9} />
      <LiquidFlow curve={utilCurve} radius={0.065} color="#7FD8F0" active={mode !== 3} speed={0.18} />

      <pointLight ref={pulse} position={[-1.4, 0.9, 0.9]} color={COLORS.orange} distance={4} intensity={0} />

      {/* callouts */}
      <TechnicalLabel anchor={[-0.2, 0.82, 0.6]} offset={[0.35, 0.85, 0]} text={labels[0]} sub={mode === 1 ? labels[4] : labels[5]} visible />
      <TechnicalLabel anchor={[-3.05, -1.35, 0.6]} offset={[-0.15, 1.0, 0.6]} text={labels[1]} accent="#7EA0F5" visible={mode !== 3} />
      <TechnicalLabel anchor={[1.6, 0.6, 0.6]} offset={[0.2, 1.05, 0]} text={labels[2]} accent="#7EA0F5" visible={mode === 3 || mode === 2} />
      <TechnicalLabel anchor={[2.6, -0.75, -0.75]} offset={[0.5, 0.55, 0.4]} text={labels[3]} accent="#7EA0F5" visible={mode === 0}/>
    </group>
  );
}
