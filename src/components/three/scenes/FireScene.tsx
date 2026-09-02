'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PipeRun, usePipeCurve, type Vec3 } from '../parts/PipeRun';
import { LiquidFlow, SprayCone } from '../parts/FlowParticles';
import { Pump, Tank, Gauge, SprinklerHead } from '../parts/Equipment';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';

/**
 * Fire protection loop: reserve -> fire pumps -> riser -> overhead sprinkler grid above storage racks.
 * Modes: 0 STANDBY · 1 PRESSURIZE · 2 DISCHARGE · 3 NETWORK
 */
export default function FireScene({ mode, labels }: { mode: number; labels: string[] }) {
  const xray = mode === 3;
  const pumping = mode === 1 || mode === 2;
  const discharge = mode === 2;

  const feed: Vec3[] = useMemo(
    () => [
      [-2.6, -1.35, -0.1],
      [-1.35, -1.35, -0.1],
      [-1.35, 1.3, -0.1],
      [3.15, 1.3, -0.1],
    ],
    []
  );
  const branches = useMemo(() => {
    const xs = [0.05, 1.5, 2.95];
    return xs.map((x) => [
      [x, 1.3, -0.1],
      [x, 1.3, -1.15],
      [x, 1.3, 1.05],
    ]) as Vec3[][];
  }, []);

  const feedCurve = usePipeCurve(feed);
  const branchCurves = [
    usePipeCurve([[0.05, 1.3, -1.15], [0.05, 1.3, 1.05]]),
    usePipeCurve([[1.5, 1.3, -1.15], [1.5, 1.3, 1.05]]),
    usePipeCurve([[2.95, 1.3, -1.15], [2.95, 1.3, 1.05]]),
  ];

  const heads: [number, number, number][] = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (const x of [0.05, 1.5, 2.95]) for (const z of [-0.9, 0.05, 0.85]) arr.push([x, 1.12, z]);
    return arr;
  }, []);
  const activeHeads = new Set([4, 5]);

  const alarm = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (alarm.current) {
      alarm.current.intensity = discharge ? 1.6 + Math.sin(state.clock.elapsedTime * 9) * 1.4 : 0;
    }
  });

  const pipeMat = { color: '#C4331F', metalness: 0.45, roughness: 0.42 };

  return (
    <group>
      {/* water reserve */}
      <Tank position={[-3.15, -0.95, -0.85]} radius={0.52} height={1.5} mat={{ color: '#B7371F', metalness: 0.4, roughness: 0.5 }} />
      {/* fire pump set */}
      <Pump position={[-2.35, -1.55, 0.55]} running={pumping} color="#C4331F" scale={0.95} />
      <Pump position={[-2.35, -1.55, -0.35]} running={pumping} color="#C4331F" scale={0.95} />
      {/* jockey / control cabinet */}
      <mesh position={[-3.05, -1.15, 0.75]}>
        <boxGeometry args={[0.5, 1.15, 0.35]} />
        <meshStandardMaterial {...MAT.paintedDark} />
      </mesh>
      <mesh position={[-3.05, -0.85, 0.93]}>
        <boxGeometry args={[0.34, 0.4, 0.02]} />
        <meshStandardMaterial
          color={pumping ? '#2FBF71' : '#39415A'}
          emissive={pumping ? '#2FBF71' : '#000000'}
          emissiveIntensity={pumping ? 0.6 : 0}
        />
      </mesh>

      {/* mains + branches */}
      <PipeRun points={feed} radius={0.1} mat={pipeMat} flangeEvery={1} transparent={xray} opacity={0.28} />
      {branches.map((b, i) => (
        <PipeRun key={i} points={b} radius={0.065} mat={pipeMat} transparent={xray} opacity={0.28} />
      ))}
      {/* sprinkler heads + drops */}
      {heads.map((h, i) => (
        <group key={i}>
          <PipeRun points={[[h[0], 1.3, h[2]], [h[0], h[1] + 0.06, h[2]]]} radius={0.03} mat={pipeMat} />
          <SprinklerHead position={h} active={discharge && activeHeads.has(i)} />
          <SprayCone position={[h[0], h[1] - 0.1, h[2]]} active={discharge && activeHeads.has(i)} count={46} height={2.6} radiusBottom={0.8} />
        </group>
      ))}

      {/* protected storage racks */}
      {[0.5, 2.4].map((x) => (
        <group key={x} position={[x, -1.45, 0]}>
          {[-0.55, 0.55].map((z) =>
            [0, 0.5].map((y) => (
              <mesh key={`${z}${y}`} position={[0, y, z]}>
                <boxGeometry args={[1.3, 0.42, 0.75]} />
                <meshStandardMaterial {...MAT.paintedNavy} />
              </mesh>
            ))
          )}
        </group>
      ))}

      <Gauge position={[-1.35, 0.45, 0.12]} rotation={[0, Math.PI / 2, 0]} value={mode === 0 ? 0.35 : pumping ? 0.82 : 0.5} scale={1.15} />
      <pointLight ref={alarm} position={[1.5, 0.6, 0]} color="#E23D28" distance={5} intensity={0} />

      {/* flow */}
      <LiquidFlow curve={feedCurve} radius={0.1} color={COLORS.cold} active={pumping} speed={mode === 2 ? 0.34 : 0.2} />
      {branchCurves.map((c, i) => (
        <LiquidFlow key={i} curve={c} radius={0.065} color={COLORS.cold} active={pumping} speed={0.28} />
      ))}

      {/* callouts */}
      <TechnicalLabel anchor={[-3.15, -0.1, -0.85]} offset={[-0.1, 0.8, 0.4]} text={labels[0]} accent="#7EA0F5" visible={mode !== 2} />
      <TechnicalLabel anchor={[-2.35, -1.3, 0.55]} offset={[-0.35, 1.05, 0.75]} text={labels[1]} accent={pumping ? COLORS.fire : '#7EA0F5'} visible={mode === 1 || mode === 0} />
      <TechnicalLabel anchor={[1.5, 1.12, 0.05]} offset={[0.35, 0.7, 0.4]} text={labels[2]} accent={discharge ? COLORS.fire : '#7EA0F5'} visible={mode === 2 || xray} />
      <TechnicalLabel anchor={[-1.35, 0.45, -0.1]} offset={[-0.6, 0.55, 0.35]} text={labels[3]} accent="#7EA0F5" visible={mode === 1 || xray} />
    </group>
  );
}
