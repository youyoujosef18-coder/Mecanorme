'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useDetail } from '../quality';

export type ColorStop = { t: number; color: string };

/**
 * Instanced particles flowing along a curve. `active` fades them in/out.
 * Optional colorStops let the fluid change color along the path
 * (e.g. raw water -> treated water).
 */
export function FlowParticles({
  curve,
  count = 60,
  size = 0.045,
  speed = 0.12,
  color = '#F57A1C',
  colorStops,
  active = true,
  spread = 0,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  count?: number;
  size?: number;
  speed?: number;
  color?: string;
  colorStops?: ColorStop[];
  active?: boolean;
  spread?: number;
}) {
  const detail = useDetail();
  const n = detail.particles(count);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const scaleRef = useRef(0);

  const { phases, offsets, dummy, vec, colA } = useMemo(() => {
    const phases = Float32Array.from({ length: n }, () => Math.random());
    const offsets = Float32Array.from({ length: n * 2 }, () => (Math.random() - 0.5) * 2);
    return {
      phases,
      offsets,
      dummy: new THREE.Object3D(),
      vec: new THREE.Vector3(),
      colA: new THREE.Color(),
    };
  }, [n]);

  const stopCols = useMemo(
    () => (colorStops ? colorStops.map((s) => ({ t: s.t, c: new THREE.Color(s.color) })) : null),
    [colorStops]
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const target = active ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * Math.min(1, delta * 4);
    const s0 = scaleRef.current;
    if (s0 < 0.01) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const t0 = state.clock.elapsedTime * speed;
    for (let i = 0; i < n; i++) {
      const t = (t0 + phases[i]) % 1;
      curve.getPointAt(t, vec);
      if (spread > 0) {
        vec.x += offsets[i * 2] * spread;
        vec.z += offsets[i * 2 + 1] * spread;
      }
      dummy.position.copy(vec);
      const pulse = 0.75 + 0.25 * Math.sin((t + phases[i]) * Math.PI * 6);
      dummy.scale.setScalar(size * s0 * pulse);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      if (stopCols) {
        let c0 = stopCols[0];
        let c1 = stopCols[stopCols.length - 1];
        for (let k = 0; k < stopCols.length - 1; k++) {
          if (t >= stopCols[k].t && t <= stopCols[k + 1].t) {
            c0 = stopCols[k];
            c1 = stopCols[k + 1];
            break;
          }
        }
        const f = c1.t === c0.t ? 0 : (t - c0.t) / (c1.t - c0.t);
        colA.copy(c0.c).lerp(c1.c, THREE.MathUtils.clamp(f, 0, 1));
        m.setColorAt(i, colA);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (stopCols && m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false} renderOrder={20}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={stopCols ? '#ffffff' : color}
        toneMapped={false}
        transparent
        opacity={0.85}
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/**
 * Sprinkler discharge. Water falling fast is a streak, not a bead, so the
 * droplets are stretched along the fall and sit inside a faint cone of mist.
 */
export function SprayCone({
  position,
  active,
  color = '#8FD6F5',
  count = 50,
  height = 1.5,
  radiusTop = 0.06,
  radiusBottom = 0.85,
}: {
  position: [number, number, number];
  active: boolean;
  color?: string;
  count?: number;
  height?: number;
  radiusTop?: number;
  radiusBottom?: number;
}) {
  const detail = useDetail();
  const n = detail.particles(count);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mist = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);
  const { seeds, dummy, base, col } = useMemo(
    () => ({
      seeds: Float32Array.from({ length: n * 3 }, () => Math.random()),
      dummy: new THREE.Object3D(),
      base: new THREE.Color(color),
      col: new THREE.Color(),
    }),
    [n, color]
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    scaleRef.current += ((active ? 1 : 0) - scaleRef.current) * Math.min(1, delta * 5);
    const s0 = scaleRef.current;
    if (mist.current) {
      const mat = mist.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 * s0;
      mist.current.visible = s0 > 0.02;
    }
    if (s0 < 0.01) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const seed = seeds[i * 3];
      const ang = seeds[i * 3 + 1] * Math.PI * 2;
      const jit = seeds[i * 3 + 2];
      // droplets accelerate as they fall, exactly like water leaving a head
      const raw = (time * (0.85 + seed * 0.6) + seed * 7) % 1;
      const t = raw * raw * 0.65 + raw * 0.35;
      const r = radiusTop + (radiusBottom - radiusTop) * t;
      dummy.position.set(
        position[0] + Math.cos(ang) * r,
        position[1] - t * height,
        position[2] + Math.sin(ang) * r
      );
      dummy.rotation.set(0, 0, 0);
      // stretched along the fall, longer the faster it is going
      const streak = (0.05 + t * 0.16) * (0.7 + jit * 0.7);
      dummy.scale.set(0.016 * s0, streak * s0, 0.016 * s0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      col.copy(base).multiplyScalar(0.55 + 0.75 * (1 - t));
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false} renderOrder={18}>
        <cylinderGeometry args={[0.5, 0.9, 1, 5, 1, true]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.9} depthWrite={false} />
      </instancedMesh>
      <mesh
        ref={mist}
        position={[position[0], position[1] - height / 2, position[2]]}
        renderOrder={17}
      >
        <coneGeometry args={[radiusBottom * 0.94, height, 18, 1, true]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={0.1}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Rising steam / heat shimmer puffs */
export function RisingPuffs({
  origin,
  active,
  color = '#DDE3EE',
  count = 26,
  height = 1.4,
  drift = 0.25,
  baseSize = 0.06,
}: {
  origin: [number, number, number];
  active: boolean;
  color?: string;
  count?: number;
  height?: number;
  drift?: number;
  baseSize?: number;
}) {
  const detail = useDetail();
  const n = detail.particles(count);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const scaleRef = useRef(0);
  const { seeds, dummy } = useMemo(
    () => ({
      seeds: Float32Array.from({ length: n * 3 }, () => Math.random()),
      dummy: new THREE.Object3D(),
    }),
    [n]
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    scaleRef.current += ((active ? 1 : 0) - scaleRef.current) * Math.min(1, delta * 4);
    const s0 = scaleRef.current;
    if (s0 < 0.01) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const sx = seeds[i * 3];
      const sz = seeds[i * 3 + 1];
      const sp = seeds[i * 3 + 2];
      const t = (time * (0.25 + sp * 0.2) + sp * 5) % 1;
      dummy.position.set(
        origin[0] + (sx - 0.5) * 0.5 + Math.sin(time * 1.5 + sp * 9) * drift * t,
        origin[1] + t * height,
        origin[2] + (sz - 0.5) * 0.5
      );
      const grow = baseSize * (0.6 + t * 1.6);
      dummy.scale.setScalar(grow * s0 * (1 - t * t));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false}>
      <sphereGeometry args={[1, 7, 7]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  );
}

/* ================================================================
   REAL FLUIDS
   Round sprites read as bubbles. Liquids get a body that fills the
   pipe and travels along it; air gets tapered streaks aligned with
   the duct, which is how air is actually drawn.
================================================================= */

const LIQUID_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const LIQUID_FRAG = /* glsl */ `
uniform float uTime, uSpeed, uRepeat, uFade, uOpacity, uS1, uS2;
uniform vec3 uC1, uC2, uC3;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  float u = vUv.x;

  // the body of liquid travelling down the line
  float w = fract(u * uRepeat - uTime * uSpeed);
  float band = smoothstep(0.02, 0.36, w) * (1.0 - smoothstep(0.52, 0.97, w));
  // a faster, shallower ripple on top so it never reads as a marching pattern
  float ripple = 0.5 + 0.5 * sin((u * uRepeat * 2.7 - uTime * uSpeed * 1.6) * 6.2831);

  vec3 col = mix(uC1, uC2, smoothstep(0.0, uS1, u));
  col = mix(col, uC3, smoothstep(uS1, uS2, u));

  // brighter at the silhouette: the line reads as a round column, not a decal
  float rim = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.35);

  float a = uOpacity * uFade * (0.30 + 0.62 * band) * (0.36 + 0.64 * rim);
  vec3 outCol = col * (0.70 + 0.48 * band + 0.10 * ripple);
  gl_FragColor = vec4(outCol, a);
}`;

/**
 * A moving body of liquid inside a run of pipe. Drawn as a sleeve just
 * outside the pipe so it is occluded by walls and equipment like anything
 * else — no x-ray dots floating through the building.
 */
export function LiquidFlow({
  curve,
  radius = 0.1,
  speed = 0.16,
  color = '#4FC3F7',
  colorStops,
  active = true,
  opacity = 0.85,
  bodies,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  /** radius of the pipe this liquid fills — the sleeve sits just outside it */
  radius?: number;
  speed?: number;
  color?: string;
  /** up to three stops; the liquid changes colour along the run */
  colorStops?: ColorStop[];
  active?: boolean;
  opacity?: number;
  /** how many slugs of liquid are in the line at once */
  bodies?: number;
}) {
  const detail = useDetail();
  const fine = detail.q === 'high';
  const fade = useRef(0);

  const geo = useMemo(() => {
    const len = curve.getLength();
    const tub = THREE.MathUtils.clamp(Math.round(len * (fine ? 7 : 4)), 16, fine ? 220 : 90);
    return new THREE.TubeGeometry(curve, tub, radius * 1.1 + 0.009, fine ? 9 : 6, false);
  }, [curve, radius, fine]);

  useEffect(() => () => geo.dispose(), [geo]);

  const uniforms = useMemo(() => {
    const s = colorStops && colorStops.length >= 3 ? colorStops : null;
    const c1 = new THREE.Color(s ? s[0].color : color);
    const c2 = new THREE.Color(s ? s[Math.floor(s.length / 2)].color : color);
    const c3 = new THREE.Color(s ? s[s.length - 1].color : color);
    return {
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uRepeat: { value: bodies ?? Math.max(2, Math.round(curve.getLength() / 2.4)) },
      uFade: { value: 0 },
      uOpacity: { value: opacity },
      uS1: { value: s ? s[Math.floor(s.length / 2)].t : 0.5 },
      uS2: { value: s ? s[s.length - 1].t * 0.92 : 1.0 },
      uC1: { value: c1 },
      uC2: { value: c2 },
      uC3: { value: c3 },
    };
  }, [curve, color, colorStops, speed, opacity, bodies]);

  useFrame((state, delta) => {
    fade.current += ((active ? 1 : 0) - fade.current) * Math.min(1, delta * 4);
    uniforms.uFade.value = fade.current;
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh geometry={geo} frustumCulled={false} renderOrder={12}>
      <shaderMaterial
        vertexShader={LIQUID_VERT}
        fragmentShader={LIQUID_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Air moving through a duct: tapered streaks lying along the flow, not
 * spheres. Deliberately drawn over the ductwork so the movement is
 * readable through sheet metal, the way an airflow diagram works.
 */
export function AirStream({
  curve,
  count = 44,
  speed = 0.2,
  color = '#4FC3F7',
  active = true,
  spread = 0.16,
  width = 0.024,
  length = 0.62,
  opacity = 0.42,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  count?: number;
  speed?: number;
  color?: string;
  active?: boolean;
  /** lateral scatter across the duct section */
  spread?: number;
  width?: number;
  length?: number;
  opacity?: number;
}) {
  const detail = useDetail();
  const n = detail.particles(count);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const fade = useRef(0);

  /** one tapered streak, bright at the head and fading to nothing at the tail */
  const geom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.85, 0.08, 1, 6, 1, true);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const a = Math.pow(THREE.MathUtils.clamp(pos.getY(i) + 0.5, 0, 1), 1.7);
      col[i * 3] = a;
      col[i * 3 + 1] = a;
      col[i * 3 + 2] = a;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  useEffect(() => () => geom.dispose(), [geom]);

  const kit = useMemo(
    () => ({
      phases: Float32Array.from({ length: n }, () => Math.random()),
      lat: Float32Array.from({ length: n * 2 }, () => (Math.random() - 0.5) * 2),
      lens: Float32Array.from({ length: n }, () => 0.55 + Math.random() * 0.95),
      dummy: new THREE.Object3D(),
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      nx: new THREE.Vector3(),
      ny: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      alt: new THREE.Vector3(1, 0, 0),
      quat: new THREE.Quaternion(),
      base: new THREE.Color(color),
      col: new THREE.Color(),
    }),
    [n, color]
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    fade.current += ((active ? 1 : 0) - fade.current) * Math.min(1, delta * 4);
    const f = fade.current;
    if (f < 0.01) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const t0 = state.clock.elapsedTime * speed;
    for (let i = 0; i < n; i++) {
      const t = (t0 + kit.phases[i]) % 1;
      curve.getPointAt(t, kit.pos);
      curve.getTangentAt(t, kit.tan).normalize();

      // a stable pair of axes across the duct section
      kit.nx.crossVectors(kit.tan, Math.abs(kit.tan.y) > 0.92 ? kit.alt : kit.up).normalize();
      kit.ny.crossVectors(kit.tan, kit.nx).normalize();
      kit.pos.addScaledVector(kit.nx, kit.lat[i * 2] * spread);
      kit.pos.addScaledVector(kit.ny, kit.lat[i * 2 + 1] * spread);

      kit.quat.setFromUnitVectors(kit.up, kit.tan);
      kit.dummy.position.copy(kit.pos);
      kit.dummy.quaternion.copy(kit.quat);
      const breathe = 0.75 + 0.25 * Math.sin((t * 3.1 + kit.phases[i]) * Math.PI * 2);
      kit.dummy.scale.set(width * f, length * kit.lens[i] * breathe * f, width * f);
      kit.dummy.updateMatrix();
      m.setMatrixAt(i, kit.dummy.matrix);

      // streaks fade in and out at the ends of the run instead of popping
      const edge = Math.min(1, t / 0.07) * Math.min(1, (1 - t) / 0.07);
      kit.col.copy(kit.base).multiplyScalar(0.45 + 0.85 * edge * breathe);
      m.setColorAt(i, kit.col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geom, undefined, n]} frustumCulled={false} renderOrder={22}>
      <meshBasicMaterial
        color="#ffffff"
        vertexColors
        toneMapped={false}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
