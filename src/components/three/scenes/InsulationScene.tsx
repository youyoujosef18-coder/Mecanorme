'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RisingPuffs } from '../parts/FlowParticles';
import { TechnicalLabel } from '../parts/Labels';
import { MAT, COLORS } from '../materials';
import { useDetail } from '../quality';

/**
 * Steam line insulation: bare pipe vs insulated section, cutaway layers, thermal view.
 * Modes: 0 BARE · 1 INSULATED · 2 SECTION · 3 THERMAL
 */
export default function InsulationScene({ mode, labels }: { mode: number; labels: string[] }) {
  const detail = useDetail();
  const seg = detail.segments(26);

  const bare = mode === 0;
  const thermal = mode === 3;
  const section = mode === 2;
  const jacketOn = mode >= 1;

  // pipe hot glow pulse
  const hotRef = useRef<THREE.MeshStandardMaterial>(null);
  const jacketGroup = useRef<THREE.Group>(null);
  const slide = useRef(0);
  useFrame((state, delta) => {
    if (hotRef.current) {
      const base = bare || thermal ? 0.65 : 0.25;
      hotRef.current.emissiveIntensity = base + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
    }
    slide.current += ((jacketOn ? 1 : 0) - slide.current) * Math.min(1, delta * 2.6);
    if (jacketGroup.current) {
      jacketGroup.current.scale.setScalar(Math.max(0.001, slide.current));
      jacketGroup.current.visible = slide.current > 0.02;
    }
  });

  const pipeR = 0.17;
  const insulR = 0.31;
  const jacketR = 0.335;
  const theta = section ? Math.PI * 1.25 : Math.PI * 2;

  // layout: pipe runs along X from -3.3 to 3.3 at y=0; supports below
  const jackXs = [-0.6, 0.7, 2.0, 3.0];

  return (
    <group>
      {/* long steam pipe */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[pipeR, pipeR, 6.6, seg]} />
        <meshStandardMaterial
          ref={hotRef}
          color={thermal ? '#8C2E14' : MAT.brushedSteel.color}
          metalness={thermal ? 0.3 : 0.85}
          roughness={0.4}
          emissive={COLORS.hot}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* flanges on bare end */}
      {[-3.0, -1.7].map((x) => (
        <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x, 0, 0]}>
          <cylinderGeometry args={[pipeR * 1.4, pipeR * 1.4, 0.09, seg]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
      ))}

      {/* insulation + cladding on right section (appears in modes >= 1) */}
      <group ref={jacketGroup}>
        {/* rockwool layer */}
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[1.2, 0, 0]}>
          <cylinderGeometry args={[insulR, insulR, 4.3, seg, 1, false, 0, theta]} />
          <meshStandardMaterial {...MAT.rockwool} side={THREE.DoubleSide} />
        </mesh>
        {/* aluminum jacket segments */}
        {jackXs.map((x) => (
          <mesh key={x} rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[x, 0, 0]}>
            <cylinderGeometry args={[jacketR, jacketR, 1.0, seg, 1, false, 0, theta]} />
            <meshStandardMaterial
              color={thermal ? '#1D3070' : MAT.aluJacket.color}
              metalness={thermal ? 0.4 : 0.82}
              roughness={0.3}
              emissive={thermal ? '#16295F' : '#000000'}
              emissiveIntensity={thermal ? 0.5 : 0}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* jacket end cap ring */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.95, 0, 0]}>
          <cylinderGeometry args={[jacketR + 0.015, jacketR + 0.015, 0.06, seg]} />
          <meshStandardMaterial {...MAT.aluJacket} />
        </mesh>
        {/* strapping bands */}
        {[-0.2, 1.1, 2.4].map((x) => (
          <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x + 0.15, 0, 0]}>
            <cylinderGeometry args={[jacketR + 0.008, jacketR + 0.008, 0.05, seg]} />
            <meshStandardMaterial {...MAT.stainless} />
          </mesh>
        ))}
      </group>

      {/* supports */}
      {[-2.4, 0.2, 2.6].map((x) => (
        <group key={x} position={[x, -1.05, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 1.5, 0.1]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <boxGeometry args={[0.34, 0.07, 0.34]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
        </group>
      ))}

      {/* heat loss shimmer on bare pipe */}
      <RisingPuffs origin={[-2.6, 0.25, 0]} active={bare || thermal} count={20} color="#FFB08A" baseSize={0.05} />
      <RisingPuffs origin={[-1.4, 0.25, 0]} active={bare} count={18} color="#FFB08A" baseSize={0.05} />
      <RisingPuffs origin={[0.6, 0.4, 0]} active={bare} count={16} color="#FFB08A" baseSize={0.045} />

      {/* thermal-view lights */}
      {thermal && (
        <>
          <pointLight position={[-2.4, 0.5, 0.6]} color="#FF5A2A" intensity={1.4} distance={3} />
          <pointLight position={[1.6, 0.5, 0.6]} color="#4FC3F7" intensity={0.8} distance={3.4} />
        </>
      )}

      {/* dimension-style callouts */}
      <TechnicalLabel anchor={[-2.5, 0.12, 0]} offset={[-0.35, 0.95, 0.3]} text={labels[0]} sub={thermal || bare ? labels[4] : undefined} accent={COLORS.hot} visible />
      <TechnicalLabel anchor={[1.35, 0.3, 0.05]} offset={[0.3, 0.95, 0.35]} text={labels[1]} sub={thermal ? labels[5] : undefined} accent={jacketOn ? COLORS.orange : '#7EA0F5'} visible={jacketOn} />
      <TechnicalLabel anchor={[1.2, -0.28, 0.12]} offset={[0.45, -0.75, 0.55]} text={labels[2]} accent="#7EA0F5" visible={section} />
      <TechnicalLabel anchor={[2.55, 0.34, 0]} offset={[0.35, 0.7, 0.3]} text={labels[3]} accent="#7EA0F5" visible={section || mode === 1} />
    </group>
  );
}
