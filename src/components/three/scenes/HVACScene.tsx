'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DuctRun, AxialFan } from '../parts/Equipment';
import { AirStream } from '../parts/FlowParticles';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';

/**
 * Air handling unit + supply duct network with three zone diffusers.
 * Modes: 0 AIRFLOW · 1 COOLING · 2 HEATING · 3 NETWORK
 */
export default function HVACScene({ mode, labels }: { mode: number; labels: string[] }) {
  const xray = mode === 3;
  const running = mode !== 3;
  const zoneColor = mode === 1 ? COLORS.airCool : mode === 2 ? COLORS.airWarm : '#9fb4d8';
  const particleColor = mode === 1 ? COLORS.airCool : mode === 2 ? COLORS.airWarm : '#CFE3F7';

  const mainPts: [number, number, number][] = useMemo(
    () => [
      [-2.35, 0.52, 0],
      [-2.35, 1.05, 0],
      [2.95, 1.05, 0],
    ],
    []
  );
  const branchXs = [-0.75, 0.95, 2.65];

  const mainCurve = useMemo(
    () => new THREE.CatmullRomCurve3(mainPts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.02),
    [mainPts]
  );
  const branchCurves = useMemo(
    () =>
      branchXs.map(
        (x) =>
          new THREE.CatmullRomCurve3(
            [new THREE.Vector3(x, 1.05, 0), new THREE.Vector3(x, 0.0, 0), new THREE.Vector3(x, -0.5, 0)],
            false,
            'catmullrom',
            0.02
          )
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const returnCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(2.6, -1.2, -1.2),
          new THREE.Vector3(2.6, 0.5, -1.2),
          new THREE.Vector3(-2.0, 0.5, -1.2),
          new THREE.Vector3(-2.0, -0.3, -1.2),
        ],
        false,
        'catmullrom',
        0.02
      ),
    []
  );

  return (
    <group>
      {/* AHU cabinet */}
      <group position={[-3.05, -0.85, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.7, 1.25]} />
          <meshStandardMaterial {...MAT.galva} />
        </mesh>
        {/* access panels */}
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, -0.1, 0.635]}>
            <boxGeometry args={[0.6, 1.2, 0.015]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
        ))}
        {/* intake grille */}
        <group position={[-0.76, 0.1, 0]}>
          {[-0.3, -0.15, 0, 0.15, 0.3].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 12]}>
              <boxGeometry args={[0.03, 0.06, 1.0]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          ))}
        </group>
        {/* coil glow strip */}
        <mesh position={[0.2, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.9, 1.0]} />
          <meshStandardMaterial
            color={zoneColor}
            emissive={mode === 1 || mode === 2 ? zoneColor : '#000000'}
            emissiveIntensity={mode === 1 || mode === 2 ? 0.8 : 0}
          />
        </mesh>
      </group>

      {/* supply fan exposed between AHU top and duct */}
      <mesh position={[-2.35, 0.06, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.14, 20]} />
        <meshStandardMaterial {...MAT.galva} />
      </mesh>
      <AxialFan position={[-2.35, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} radius={0.26} running={running} color={COLORS.orange} />

      {/* supply duct network */}
      <DuctRun points={mainPts} width={0.56} height={0.4} transparent={xray} opacity={0.3} />
      {branchXs.map((x) => (
        <DuctRun key={x} points={[[x, 1.05, 0], [x, -0.05, 0]]} width={0.34} height={0.3} transparent={xray} opacity={0.3} />
      ))}
      {/* diffusers */}
      {branchXs.map((x) => (
        <group key={x} position={[x, -0.12, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.06, 0.5]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
          <mesh position={[0, -0.045, 0]}>
            <boxGeometry args={[0.4, 0.03, 0.4]} />
            <meshStandardMaterial color="#E6E9F2" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* return duct */}
      <DuctRun
        points={[
          [2.6, -1.2, -1.2],
          [2.6, 0.5, -1.2],
          [-2.0, 0.5, -1.2],
          [-2.0, -0.35, -1.2],
        ]}
        width={0.46}
        height={0.34}
        mat={MAT.pvcGrey}
        transparent={xray}
        opacity={0.3}
      />

      {/* zone floors with thermal tint */}
      {branchXs.map((x) => (
        <group key={x}>
          <mesh position={[x, -1.82, 0]}>
            <boxGeometry args={[1.5, 0.08, 1.9]} />
            <meshStandardMaterial {...MAT.slab} />
          </mesh>
          <mesh position={[x, -1.74, 0]}>
            <boxGeometry args={[1.44, 0.02, 1.84]} />
            <meshStandardMaterial
              color={zoneColor}
              transparent
              opacity={mode === 1 || mode === 2 ? 0.4 : 0.08}
              emissive={zoneColor}
              emissiveIntensity={mode === 1 || mode === 2 ? 0.5 : 0}
            />
          </mesh>
        </group>
      ))}

      {/* airflow */}
      <AirStream curve={mainCurve} count={54} color={particleColor} active={running} speed={0.2} spread={0.13} width={0.022} length={0.5} />
      {branchCurves.map((c, i) => (
        <AirStream key={i} curve={c} count={20} color={particleColor} active={running} speed={0.26} spread={0.1} width={0.018} length={0.34} />
      ))}
      <AirStream curve={returnCurve} count={34} color="#93A8CE" active={running} speed={0.14} spread={0.1} width={0.019} length={0.42} opacity={0.4} />

      {/* callouts */}
      <TechnicalLabel anchor={[-3.05, 0.05, 0.4]} offset={[-0.2, 1.35, 0.4]} text={labels[0]} visible />
      <TechnicalLabel anchor={[0.3, 1.05, 0]} offset={[0.1, 0.75, 0]} text={labels[1]} accent="#7EA0F5" visible={mode === 0 || xray} />
      <TechnicalLabel anchor={[0.95, -0.12, 0]} offset={[0.55, 0.4, 0.5]} text={labels[2]} accent="#7EA0F5" visible={mode !== 2} />
      <TechnicalLabel anchor={[-2.0, 0.5, -1.2]} offset={[-0.3, 0.7, -0.2]} text={labels[3]} accent="#7EA0F5" visible={xray} />
    </group>
  );
}
