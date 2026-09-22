'use client';

import React, { memo, type MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { QualityContext } from '@/components/three/quality';
import CinematicCamera, { type Waypoint } from '@/components/three/CinematicCamera';
import { useContextLossRecovery, useDeviceTier } from '@/lib/hooks';

const BuildingScene = dynamic(() => import('@/components/three/scenes/BuildingScene'), { ssr: false });

/**
 * The WebGL half of the hero, isolated behind memo so the overlay's scroll
 * state never re-reconciles the building's few hundred meshes.
 */
function HeroStage({
  waypoints,
  progressRef,
  focusU,
  focusRef,
  mobile,
  portrait = true,
  reduced,
}: {
  waypoints: Waypoint[];
  progressRef: MutableRefObject<number>;
  focusU: MutableRefObject<number | null>;
  focusRef: MutableRefObject<number>;
  mobile: boolean;
  portrait?: boolean;
  reduced: boolean;
}) {
  const device = useDeviceTier();
  const recovery = useContextLossRecovery();
  const weak = device.tier === 'weak';

  return (
    <Canvas
      key={recovery.key}
      dpr={[1, Math.min(device.maxDpr, mobile ? 1.35 : 1.5)]}
      camera={{
        position: waypoints[0].pos,
        // portrait phones get the widened lens; a phone on its side keeps a tighter one
        fov: mobile ? (portrait ? 46 : 38) : 34,
        near: 0.3,
        far: 240,
      }}
      gl={{ antialias: !weak, alpha: true, powerPreference: 'high-performance' }}
      // the hero canvas never captures anything: the finger always scrolls the story
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        recovery.attach(gl.domElement);
      }}
    >
      <QualityContext.Provider value={mobile || weak ? 'low' : 'high'}>
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#cfdcf5', '#1a2650', 0.85]} />
        <directionalLight position={[18, 26, 14]} intensity={2.1} />
        <directionalLight position={[-16, 12, -12]} intensity={0.7} color="#8fa9e8" />
        <Environment resolution={32} frames={1}>
          <Lightformer intensity={2.4} position={[0, 14, -22]} scale={[26, 10, 1]} color="#dfe6f5" />
          <Lightformer intensity={1.5} position={[-20, 6, 8]} scale={[10, 14, 1]} rotation-y={Math.PI / 2} color="#c8d2ea" />
          <Lightformer intensity={1.2} position={[20, 8, 6]} scale={[10, 14, 1]} rotation-y={-Math.PI / 2} color="#ffd9b0" />
          <Lightformer intensity={0.7} position={[0, -8, 0]} scale={[30, 30, 1]} rotation-x={Math.PI / 2} color="#3a4a7a" />
        </Environment>

        <BuildingScene progressRef={progressRef} focusRef={focusRef} />

        <CinematicCamera waypoints={waypoints} progressRef={progressRef} focusU={focusU} reduced={reduced} />
      </QualityContext.Provider>
    </Canvas>
  );
}

export default memo(HeroStage);
