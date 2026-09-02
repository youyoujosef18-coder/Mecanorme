'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDetail } from '../quality';

export type Vec3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);

export function segmentTransform(a: Vec3, b: Vec3) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  return { mid, quat, len };
}

/**
 * A piping run through a list of points: cylinders between points,
 * welded joint spheres at corners, optional flange pairs.
 */
export function PipeRun({
  points,
  radius = 0.09,
  mat,
  flangeEvery = 0,
  jointScale = 1.32,
  transparent,
  opacity = 1,
}: {
  points: Vec3[];
  radius?: number;
  mat: Record<string, unknown>;
  flangeEvery?: number;
  jointScale?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  const detail = useDetail();
  const radial = detail.segments(20);

  const segments = useMemo(() => {
    const segs: { mid: THREE.Vector3; quat: THREE.Quaternion; len: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      segs.push(segmentTransform(points[i], points[i + 1]));
    }
    return segs;
  }, [points]);

  const matProps = transparent
    ? { ...mat, transparent: true, opacity, depthWrite: false }
    : mat;

  return (
    <group>
      {segments.map((s, i) => (
        <group key={i}>
          <mesh position={s.mid} quaternion={s.quat}>
            <cylinderGeometry args={[radius, radius, s.len, radial]} />
            <meshStandardMaterial {...(matProps as object)} />
          </mesh>
          {flangeEvery > 0 && i % flangeEvery === 0 && (
            <mesh position={s.mid} quaternion={s.quat}>
              <cylinderGeometry args={[radius * 1.55, radius * 1.55, radius * 1.1, radial]} />
              <meshStandardMaterial {...(mat as object)} />
            </mesh>
          )}
        </group>
      ))}
      {points.slice(1, -1).map((p, i) => (
        <mesh key={`j${i}`} position={p}>
          <sphereGeometry args={[radius * jointScale, radial, radial]} />
          <meshStandardMaterial {...(matProps as object)} />
        </mesh>
      ))}
    </group>
  );
}

/** Fluid core shown inside a cutaway pipe run */
export function FluidCore({ points, radius, color }: { points: Vec3[]; radius: number; color: string }) {
  const detail = useDetail();
  const segments = useMemo(() => {
    const segs: { mid: THREE.Vector3; quat: THREE.Quaternion; len: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) segs.push(segmentTransform(points[i], points[i + 1]));
    return segs;
  }, [points]);
  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={s.mid} quaternion={s.quat}>
          <cylinderGeometry args={[radius, radius, s.len, detail.segments(14)]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Catmull-Rom curve hugging a pipe path — used by FlowParticles */
export function usePipeCurve(points: Vec3[]) {
  return useMemo(() => {
    const vecs = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.02);
    return curve;
  }, [points]);
}
