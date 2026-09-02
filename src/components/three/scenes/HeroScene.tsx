'use client';

import React, { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Gear, Pump } from '../parts/Equipment';
import { FlowParticles } from '../parts/FlowParticles';
import { MAT, COLORS } from '../materials';
import { useDetail } from '../quality';

/**
 * Signature hero assembly: motor -> open gear transmission -> pump,
 * with an orange hydraulic loop circulating energy through the system.
 * Mouse steers the assembly; scroll gently separates the components.
 */
export default function HeroScene({ scrollRef }: { scrollRef?: MutableRefObject<number> }) {
  const detail = useDetail();
  const root = useRef<THREE.Group>(null);
  const motorG = useRef<THREE.Group>(null);
  const pumpG = useRef<THREE.Group>(null);
  const gearsG = useRef<THREE.Group>(null);
  const ringsG = useRef<THREE.Group>(null);
  const shaftA = useRef<THREE.Mesh>(null);
  const shaftB = useRef<THREE.Mesh>(null);

  const loop = useMemo(() => {
    const pts = [
      new THREE.Vector3(1.95, 0.25, 0.35),
      new THREE.Vector3(2.5, 1.0, 0.2),
      new THREE.Vector3(1.4, 1.85, -0.3),
      new THREE.Vector3(-0.6, 2.05, -0.5),
      new THREE.Vector3(-2.4, 1.5, -0.25),
      new THREE.Vector3(-2.75, 0.4, 0.15),
      new THREE.Vector3(-2.1, -0.1, 0.45),
    ];
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
  }, []);

  const tube = useMemo(() => new THREE.TubeGeometry(loop, detail.segments(70), 0.055, detail.segments(12), false), [loop, detail]);

  useFrame((state, delta) => {
    const p = scrollRef?.current ?? 0;
    const t = state.clock.elapsedTime;
    if (root.current) {
      // idle bob + mouse steering
      const px = state.pointer.x;
      const py = state.pointer.y;
      root.current.rotation.y += ((px * 0.35 - root.current.rotation.y) * 0.04);
      root.current.rotation.x += ((-py * 0.14 - root.current.rotation.x) * 0.04);
      root.current.position.y = Math.sin(t * 0.7) * 0.06 - p * 0.3;
    }
    // scroll separation
    if (motorG.current) motorG.current.position.x = -1.75 - p * 1.15;
    if (pumpG.current) pumpG.current.position.x = 1.55 + p * 1.15;
    if (gearsG.current) gearsG.current.position.y = 0.25 + p * 0.55;
    if (ringsG.current) {
      ringsG.current.rotation.z = t * 0.1;
      ringsG.current.rotation.x = 0.5 + t * 0.05;
      const s = 1 + p * 0.35;
      ringsG.current.scale.setScalar(s);
    }
    if (shaftA.current) shaftA.current.rotation.x += delta * 6;
    if (shaftB.current) shaftB.current.rotation.x += delta * 6;
  });

  return (
    <group ref={root} position={[0, -0.2, 0]}>
      {/* skid */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[4.6, 0.16, 1.7]} />
        <meshStandardMaterial {...MAT.paintedDark} />
      </mesh>
      {[-2.0, 2.0].map((x) =>
        [-0.65, 0.65].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -1.22, z]}>
            <boxGeometry args={[0.3, 0.18, 0.3]} />
            <meshStandardMaterial {...MAT.rubber} />
          </mesh>
        ))
      )}

      {/* motor block */}
      <group ref={motorG} position={[-1.75, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.5, detail.segments(26)]} />
          <meshStandardMaterial {...MAT.paintedNavy} />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((x) => (
          <mesh key={x} rotation={[0, 0, Math.PI / 2]} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.54, 0.54, 0.06, detail.segments(26)]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {/* foot */}
        <mesh position={[0, -0.82, 0]}>
          <boxGeometry args={[1.3, 0.3, 1.1]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {/* shaft out */}
        <mesh ref={shaftA} rotation={[0, 0, Math.PI / 2]} position={[0.95, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
          <meshStandardMaterial {...MAT.stainless} />
        </mesh>
      </group>

      {/* open gear transmission */}
      <group ref={gearsG} position={[0, 0.25, 0]}>
        <Gear position={[-0.42, 0, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.62} teeth={16} thickness={0.16} speed={0.9} direction={1} />
        <Gear position={[0.62, -0.32, 0]} rotation={[Math.PI / 2, 0, 0.196]} radius={0.4} teeth={11} thickness={0.16} speed={1.4} direction={-1} mat={{ color: '#F57A1C', metalness: 0.55, roughness: 0.35 }} />
        {/* bearing blocks */}
        {[-0.42, 0.62].map((x, i) => (
          <mesh key={x} position={[x, i === 0 ? -0.85 : -1.0, 0.32]}>
            <boxGeometry args={[0.4, 0.5, 0.22]} />
            <meshStandardMaterial {...MAT.brushedSteel} />
          </mesh>
        ))}
      </group>

      {/* pump end */}
      <group ref={pumpG} position={[1.55, 0, 0]}>
        <Pump position={[0.35, -0.35, 0]} running scale={1.5} />
        <mesh ref={shaftB} rotation={[0, 0, Math.PI / 2]} position={[-0.55, -0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
          <meshStandardMaterial {...MAT.stainless} />
        </mesh>
      </group>

      {/* hydraulic energy loop */}
      <mesh geometry={tube}>
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <FlowParticles curve={loop} count={70} color={COLORS.orange} active speed={0.14} size={0.06} />

      {/* technical orbit rings */}
      <group ref={ringsG} position={[0, 0.2, 0]}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[3.05, 0.008, 8, detail.segments(90)]} />
          <meshBasicMaterial color="#4A5578" transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
          <torusGeometry args={[3.5, 0.006, 8, detail.segments(90)]} />
          <meshBasicMaterial color={COLORS.orange} transparent opacity={0.28} toneMapped={false} />
        </mesh>
        {/* orbit markers */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2 + 0.6;
          return (
            <mesh key={i} position={[Math.cos(a) * 3.05, Math.sin(a) * 3.05 * Math.cos(Math.PI / 2.4), Math.sin(a) * 3.05 * Math.sin(Math.PI / 2.4)]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color={COLORS.orange} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
