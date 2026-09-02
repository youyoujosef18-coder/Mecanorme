'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MAT } from '../materials';
import { useDetail } from '../quality';

/* ================= VALVE (gate valve with handwheel) ================= */
export function Valve({
  position,
  rotation = [0, 0, 0],
  open = 1,
  scale = 1,
  wheelColor = '#C4331F',
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** 0 = closed, 1 = fully open */
  open?: number;
  scale?: number;
  wheelColor?: string;
}) {
  const wheel = useRef<THREE.Group>(null);
  const stem = useRef<THREE.Mesh>(null);
  const cur = useRef(open);

  useFrame((_, delta) => {
    cur.current += (open - cur.current) * Math.min(1, delta * 2.4);
    if (wheel.current) wheel.current.rotation.y = cur.current * Math.PI * 3;
    if (stem.current) stem.current.position.y = 0.34 + cur.current * 0.08;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* body */}
      <mesh>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial {...MAT.paintedNavy} />
      </mesh>
      {/* flange collars */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 16]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
      ))}
      {/* bonnet */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.22, 14]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      {/* stem */}
      <mesh ref={stem} position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
        <meshStandardMaterial {...MAT.stainless} />
      </mesh>
      {/* handwheel */}
      <group ref={wheel} position={[0, 0.44, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.022, 10, 26]} />
          <meshStandardMaterial color={wheelColor} metalness={0.35} roughness={0.4} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.3, 0.018, 0.03]} />
            <meshStandardMaterial color={wheelColor} metalness={0.35} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= CENTRIFUGAL PUMP + MOTOR SKID ================= */
export function Pump({
  position,
  rotation = [0, 0, 0],
  running = true,
  scale = 1,
  color = MAT.paintedOrange.color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  running?: boolean;
  scale?: number;
  color?: string;
}) {
  const grp = useRef<THREE.Group>(null);
  const shaft = useRef<THREE.Mesh>(null);
  const speed = useRef(0);

  useFrame((state, delta) => {
    speed.current += ((running ? 1 : 0) - speed.current) * Math.min(1, delta * 1.8);
    if (shaft.current) shaft.current.rotation.x += delta * 14 * speed.current;
    if (grp.current) {
      const v = speed.current * 0.004;
      grp.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 60) * v;
    }
  });

  return (
    <group ref={grp} position={position} rotation={rotation} scale={scale}>
      {/* skid */}
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[1.15, 0.08, 0.42]} />
        <meshStandardMaterial {...MAT.paintedDark} />
      </mesh>
      {/* motor with cooling fins */}
      <group position={[-0.32, 0.08, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.44, 18]} />
          <meshStandardMaterial {...MAT.paintedNavy} />
        </mesh>
        {[-0.13, 0, 0.13].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.165, 0.165, 0.02, 18]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
        ))}
        {/* junction box */}
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.14, 0.09, 0.12]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
      </group>
      {/* coupling shaft */}
      <mesh ref={shaft} position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 10]} />
        <meshStandardMaterial {...MAT.stainless} />
      </mesh>
      {/* volute */}
      <group position={[0.3, 0.08, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.19, 0.19, 0.18, 20]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} />
        </mesh>
        {/* suction inlet */}
        <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.14, 14]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} />
        </mesh>
        {/* discharge up */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.2, 14]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= VERTICAL / HORIZONTAL TANK ================= */
export function Tank({
  position,
  radius = 0.5,
  height = 1.6,
  horizontal = false,
  mat = MAT.stainless,
  legs = true,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  horizontal?: boolean;
  mat?: Record<string, unknown>;
  legs?: boolean;
  rotation?: [number, number, number];
}) {
  const detail = useDetail();
  const seg = detail.segments(24);
  const body = (
    <group rotation={horizontal ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, seg]} />
        <meshStandardMaterial {...(mat as object)} />
      </mesh>
      <mesh position={[0, height / 2, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[radius, seg, 14]} />
        <meshStandardMaterial {...(mat as object)} />
      </mesh>
      <mesh position={[0, -height / 2, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[radius, seg, 14]} />
        <meshStandardMaterial {...(mat as object)} />
      </mesh>
    </group>
  );
  return (
    <group position={position} rotation={rotation}>
      {body}
      {legs &&
        !horizontal &&
        [0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * radius * 0.8, -height / 2 - 0.22, Math.sin(a) * radius * 0.8]}
            >
              <boxGeometry args={[0.07, 0.45, 0.07]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          );
        })}
      {horizontal && (
        <>
          {[-height * 0.3, height * 0.3].map((x) => (
            <mesh key={x} position={[x, -radius - 0.1, 0]}>
              <boxGeometry args={[0.12, 0.3, radius * 1.7]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* ================= FILTER VESSEL (media filter) ================= */
export function FilterVessel({
  position,
  radius = 0.38,
  height = 1.35,
  color = '#2F6F8F',
  highlighted = false,
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  color?: string;
  highlighted?: boolean;
}) {
  const detail = useDetail();
  const seg = detail.segments(22);
  const emissive = highlighted ? color : '#000000';
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, seg]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} emissive={emissive} emissiveIntensity={highlighted ? 0.25 : 0} />
      </mesh>
      {[height / 2, -height / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[radius, seg, 12]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} emissive={emissive} emissiveIntensity={highlighted ? 0.25 : 0} />
        </mesh>
      ))}
      {/* top manway + valve cluster */}
      <mesh position={[0, height / 2 + 0.28, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 12]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      {/* legs */}
      {[0, 1, 2].map((i) => {
        const a = (i * Math.PI * 2) / 3;
        return (
          <mesh key={i} position={[Math.cos(a) * radius * 0.75, -height / 2 - 0.3, Math.sin(a) * radius * 0.75]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ================= RECTANGULAR DUCT ================= */
export function DuctRun({
  points,
  width = 0.5,
  height = 0.34,
  mat = MAT.galva,
  transparent,
  opacity = 1,
}: {
  points: [number, number, number][];
  width?: number;
  height?: number;
  mat?: Record<string, unknown>;
  transparent?: boolean;
  opacity?: number;
}) {
  const UP = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const segs = useMemo(() => {
    const arr: { mid: THREE.Vector3; quat: THREE.Quaternion; len: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = new THREE.Vector3(...points[i]);
      const b = new THREE.Vector3(...points[i + 1]);
      const dir = b.clone().sub(a);
      const len = dir.length();
      arr.push({
        mid: a.clone().add(b).multiplyScalar(0.5),
        quat: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
        len,
      });
    }
    return arr;
  }, [points, UP]);

  const mp = transparent ? { ...mat, transparent: true, opacity, depthWrite: false } : mat;

  return (
    <group>
      {segs.map((s, i) => (
        <group key={i} position={s.mid} quaternion={s.quat}>
          <mesh>
            <boxGeometry args={[width, s.len, height]} />
            <meshStandardMaterial {...(mp as object)} />
          </mesh>
          {/* flange ribs */}
          {Array.from({ length: Math.max(1, Math.floor(s.len / 0.8)) }).map((_, k) => {
            const y = -s.len / 2 + ((k + 0.5) * s.len) / Math.max(1, Math.floor(s.len / 0.8));
            return (
              <mesh key={k} position={[0, y, 0]}>
                <boxGeometry args={[width + 0.05, 0.035, height + 0.05]} />
                <meshStandardMaterial {...(mat as object)} />
              </mesh>
            );
          })}
        </group>
      ))}
      {points.slice(1, -1).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[width + 0.04, width + 0.04, height + 0.04]} />
          <meshStandardMaterial {...(mp as object)} />
        </mesh>
      ))}
    </group>
  );
}

/* ================= AXIAL FAN (visible impeller) ================= */
export function AxialFan({
  position,
  rotation = [0, 0, 0],
  radius = 0.3,
  running = true,
  color = '#F57A1C',
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  running?: boolean;
  color?: string;
}) {
  const rotor = useRef<THREE.Group>(null);
  const speed = useRef(0);
  useFrame((_, delta) => {
    speed.current += ((running ? 1 : 0) - speed.current) * Math.min(1, delta * 2);
    if (rotor.current) rotor.current.rotation.z += delta * 16 * speed.current;
  });
  return (
    <group position={position} rotation={rotation}>
      {/* housing ring */}
      <mesh>
        <torusGeometry args={[radius, 0.045, 12, 30]} />
        <meshStandardMaterial {...MAT.galva} />
      </mesh>
      <group ref={rotor}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.22, radius * 0.22, 0.09, 14]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} position={[0, 0, 0]}>
            <boxGeometry args={[radius * 1.7, radius * 0.28, 0.02]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ================= SPRINKLER HEAD ================= */
export function SprinklerHead({
  position,
  active = false,
}: {
  position: [number, number, number];
  active?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 8]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.05, 0.03, 0.09, 10]} />
        <meshStandardMaterial {...MAT.copper} />
      </mesh>
      {/* deflector */}
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 12]} />
        <meshStandardMaterial {...MAT.copper} />
      </mesh>
      {active && (
        <pointLight position={[0, -0.2, 0]} color="#4FC3F7" intensity={1.2} distance={1.6} />
      )}
    </group>
  );
}

/* ================= PRESSURE GAUGE ================= */
export function Gauge({
  position,
  rotation = [0, 0, 0],
  value = 0.6,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** 0..1 needle position */
  value?: number;
  scale?: number;
}) {
  const needle = useRef<THREE.Mesh>(null);
  const cur = useRef(0);
  useFrame((state, delta) => {
    const jitter = Math.sin(state.clock.elapsedTime * 7) * 0.015;
    cur.current += (value + jitter - cur.current) * Math.min(1, delta * 3);
    if (needle.current) {
      needle.current.rotation.z = THREE.MathUtils.lerp(2.4, -2.4, THREE.MathUtils.clamp(cur.current, 0, 1));
    }
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
        <meshStandardMaterial {...MAT.stainless} />
      </mesh>
      <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.006, 20]} />
        <meshStandardMaterial color="#F4F5F8" roughness={0.4} />
      </mesh>
      <mesh ref={needle} position={[0, 0, 0.036]}>
        <boxGeometry args={[0.012, 0.085, 0.004]} />
        <meshStandardMaterial color="#E23D28" />
      </mesh>
    </group>
  );
}

/* ================= GEAR ================= */
export function Gear({
  position,
  rotation = [0, 0, 0],
  radius = 0.4,
  teeth = 12,
  thickness = 0.12,
  spinning = true,
  direction = 1,
  speed = 1,
  mat = MAT.brushedSteel,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  teeth?: number;
  thickness?: number;
  spinning?: boolean;
  direction?: number;
  speed?: number;
  mat?: Record<string, unknown>;
}) {
  const grp = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame((_, delta) => {
    spin.current += ((spinning ? 1 : 0) - spin.current) * Math.min(1, delta * 1.5);
    if (grp.current) grp.current.rotation.y += delta * speed * direction * spin.current;
  });
  const toothW = (2 * Math.PI * radius) / teeth / 2.1;
  return (
    <group position={position} rotation={rotation}>
      <group ref={grp}>
        <mesh>
          <cylinderGeometry args={[radius, radius, thickness, 28]} />
          <meshStandardMaterial {...(mat as object)} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius * 0.18, radius * 0.18, thickness * 1.6, 14]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {Array.from({ length: teeth }).map((_, i) => {
          const a = (i * Math.PI * 2) / teeth;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * (radius + toothW * 0.45), 0, Math.sin(a) * (radius + toothW * 0.45)]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[toothW, thickness, toothW * 1.15]} />
              <meshStandardMaterial {...(mat as object)} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ================= SPRINKLER GRID (instanced) =================
   Full-coverage protection means a lot of heads. Three instanced meshes
   draw the whole grid, so covering every room costs three draw calls
   instead of one per head.
================================================================= */
export function SprinklerGrid({
  heads,
  y,
  mainY,
  color = '#C4331F',
}: {
  /** [x, z] of every head on this level */
  heads: [number, number][];
  /** height of the head itself */
  y: number;
  /** height of the branch main it drops off */
  mainY: number;
  color?: string;
}) {
  const detail = useDetail();
  const seg = detail.segments(10);
  const drops = useRef<THREE.InstancedMesh>(null);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const plates = useRef<THREE.InstancedMesh>(null);
  const n = heads.length;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const dropLen = Math.max(0.06, mainY - y - 0.06);
    for (let i = 0; i < n; i++) {
      const [x, z] = heads[i];
      dummy.rotation.set(0, 0, 0);

      dummy.position.set(x, y + 0.06 + dropLen / 2, z);
      dummy.scale.set(1, dropLen, 1);
      dummy.updateMatrix();
      drops.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y + 0.05, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, y - 0.035, z);
      dummy.updateMatrix();
      plates.current?.setMatrixAt(i, dummy.matrix);
    }
    if (drops.current) drops.current.instanceMatrix.needsUpdate = true;
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (plates.current) plates.current.instanceMatrix.needsUpdate = true;
  }, [heads, n, y, mainY, dummy]);

  return (
    <group>
      <instancedMesh ref={drops} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[0.022, 0.022, 1, 6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={bodies} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[0.036, 0.03, 0.12, seg]} />
        <meshStandardMaterial {...MAT.brushedSteel} />
      </instancedMesh>
      <instancedMesh ref={plates} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[0.058, 0.058, 0.014, seg]} />
        <meshStandardMaterial color="#D8B23A" metalness={0.75} roughness={0.32} />
      </instancedMesh>
    </group>
  );
}
