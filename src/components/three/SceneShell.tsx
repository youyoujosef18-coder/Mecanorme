'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { QualityContext, type Quality } from './quality';
import {
  useContextLossRecovery,
  useDeviceTier,
  useIsMobile,
  usePrefersReducedMotion,
} from '@/lib/hooks';

/**
 * Shared Canvas setup: offline procedural environment (no HDRI downloads),
 * industrial three-point lighting, grounded contact shadows, restrained orbit.
 *
 * Touch: the canvas never claims vertical pans (`touch-action: pan-y`), and when
 * `interactive` is false it ignores the pointer entirely so a finger over the
 * scene always scrolls the page.
 */
export default function SceneShell({
  children,
  camera = [5.2, 3.4, 6.2],
  target = [0, 0.4, 0],
  fov = 36,
  orbit = true,
  autoRotate = true,
  zoom = false,
  floor = -1.9,
  minPolar = Math.PI / 4,
  maxPolar = Math.PI / 1.95,
  className,
  interactive = true,
  onPointerDown,
}: {
  children: React.ReactNode;
  camera?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  orbit?: boolean;
  autoRotate?: boolean;
  zoom?: boolean;
  floor?: number | null;
  minPolar?: number;
  maxPolar?: number;
  className?: string;
  /** false = display only: no orbit, no pointer capture */
  interactive?: boolean;
  onPointerDown?: () => void;
}) {
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const device = useDeviceTier();
  const recovery = useContextLossRecovery();
  const weak = device.tier === 'weak';
  const quality: Quality = mobile || weak ? 'low' : 'high';
  const interacted = useRef(false);

  return (
    <Canvas
      key={recovery.key}
      className={className}
      dpr={[1, Math.min(device.maxDpr, mobile ? 1.4 : 1.8)]}
      camera={{ position: camera, fov }}
      gl={{ antialias: !weak, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y', pointerEvents: interactive ? 'auto' : 'none' }}
      onPointerDown={() => {
        interacted.current = true;
        onPointerDown?.();
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        recovery.attach(gl.domElement);
      }}
    >
      <QualityContext.Provider value={quality}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#cdd8f2', '#1a2650', 0.75]} />
          <directionalLight position={[6, 10, 4]} intensity={2.3} />
          <directionalLight position={[-7, 4, -6]} intensity={0.95} color="#7EA0F5" />
          <pointLight position={[0, 3, -5]} intensity={0.6} color="#F57A1C" />
          <Environment resolution={64} frames={1}>
            <Lightformer intensity={2.2} position={[0, 5, -9]} scale={[10, 4, 1]} color="#dfe6f5" />
            <Lightformer intensity={1.4} position={[-6, 2, 3]} scale={[4, 6, 1]} rotation-y={Math.PI / 2} color="#c8d2ea" />
            <Lightformer intensity={1.1} position={[7, 3, 2]} scale={[4, 6, 1]} rotation-y={-Math.PI / 2} color="#ffd9b0" />
            <Lightformer intensity={0.8} position={[0, -4, 0]} scale={[12, 12, 1]} rotation-x={Math.PI / 2} color="#3a4a7a" />
          </Environment>
          {children}
          {floor !== null && quality === 'high' && !weak && (
            <ContactShadows position={[0, floor, 0]} opacity={0.42} scale={16} blur={2.6} far={5} resolution={256} frames={60} />
          )}
          {orbit && (
            <OrbitControls
              enabled={interactive}
              enablePan={false}
              enableZoom={zoom}
              autoRotate={autoRotate && !reduced}
              autoRotateSpeed={0.55}
              minPolarAngle={minPolar}
              maxPolarAngle={maxPolar}
              target={target}
              makeDefault
            />
          )}
        </Suspense>
      </QualityContext.Provider>
    </Canvas>
  );
}
