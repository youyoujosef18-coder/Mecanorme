'use client';

import React, { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PipeRun, usePipeCurve, type Vec3 } from '../parts/PipeRun';
import { AirStream, LiquidFlow, SprayCone } from '../parts/FlowParticles';
import { Valve, Pump, Tank, FilterVessel, DuctRun, AxialFan, SprinklerGrid, Gauge } from '../parts/Equipment';
import { MAT, COLORS } from '../materials';
import { useDetail } from '../quality';

/**
 * A technical facility in cutaway, on two working levels.
 *
 *   RDC   west room     traitement des eaux — bâches, filtration, osmose, dosage
 *   RDC   east room     protection incendie — réserve et groupe motopompe
 *   RDC   front-east    plomberie — gaine technique, bloc sanitaire, ballon ECS
 *   RDC   centre        hall desservi — diffuseurs, sprinklers, escalier
 *   R+1   west          CVC — CTA, groupe froid, échangeur
 *   R+1   centre-est    tuyauterie — rack process, pompes, vannes
 *   R+1   sous toiture  calorifugeage — collecteur chaud nu / laine / tôlé
 *
 * The two levels are tied together by real vertical links: a stair, a duct
 * drop, a treated-water riser, a fire riser and the plumbing stacks — each
 * passing through its own opening in the slab.
 *
 * Building grid: 24 m x 12 m, two levels. 1 unit = 1 m.
 */

const BW = 24;
const BD = 12;
const X0 = -BW / 2;
const X1 = BW / 2;
const Z0 = -BD / 2;
const Z1 = BD / 2;

const L1 = 4.2; // centre of the first-floor slab
const SLAB_T = 0.34;
const F1 = L1 + SLAB_T / 2; // 4.37 — the plant floor you walk on
const CEIL0 = L1 - SLAB_T / 2; // 4.03 — underside of the slab
const L2 = 8.4; // centre of the roof deck
const CEIL1 = L2 - 0.15; // 8.25 — underside of the roof

const VOID0 = 3.3; // services in the ground-floor ceiling void

/** the one red used by every part of the fire network */
const FIRE_RED = { color: '#C4331F', metalness: 0.4, roughness: 0.45 };
const COLD_BLUE = { color: '#2F6FD6', metalness: 0.3, roughness: 0.42 };
const HOT_ORANGE = { color: '#D96410', metalness: 0.3, roughness: 0.42 };

/** first-floor slab, cut into pieces so the openings are real holes */
const SLAB: [number, number, number, number][] = [
  [-12, 12, -6.0, -4.4],
  [-12, -3.6, -4.4, -3.2],
  [-0.6, 12, -4.4, -3.2],
  [-12, -3.6, -3.2, -3.0],
  [-0.6, 8.4, -3.2, -3.0],
  [9.2, 12, -3.2, -3.0],
  [-12, 8.4, -3.0, -2.4],
  [9.2, 12, -3.0, -2.4],
  [-12, 12, -2.4, 0.2],
  [-12, 2.4, 0.2, 2.3],
  [5.2, 12, 0.2, 2.3],
  [-12, 2.4, 2.3, 4.7],
  [5.2, 9.3, 2.3, 4.7],
  [11.7, 12, 2.3, 4.7],
  [-12, 12, 4.7, 6.0],
];

/** kerbs around the two big openings, so they read as builder's work */
const KERBS: [number, number, number, number][] = [
  [2.4, 5.2, 0.15, 0.25],
  [2.4, 5.2, 4.65, 4.75],
  [2.35, 2.45, 0.2, 4.7],
  [5.15, 5.25, 0.2, 4.7],
  [9.3, 11.7, 2.25, 2.35],
  [9.25, 9.35, 2.3, 4.7],
];

export default function BuildingScene({
  progressRef,
  focusRef,
}: {
  progressRef: MutableRefObject<number>;
  /** index of the emphasised trade, or -1 */
  focusRef: MutableRefObject<number>;
}) {
  const detail = useDetail();
  const fine = detail.q === 'high';
  const seg = detail.segments(18);

  const facade = useRef<THREE.MeshStandardMaterial>(null);
  const claddingMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const roofRef = useRef<THREE.Mesh>(null);

  /* ========== 01 · TRAITEMENT DES EAUX — enclosed room, ground floor west ========== */
  const waterLine: Vec3[] = useMemo(
    () => [
      [-10.6, 2.55, -4.4], // out of the raw water tank
      [-10.6, 3.0, -4.4],
      [-9.6, 3.0, -4.4],
      [-9.6, 2.4, -4.4],
      [-8.9, 2.4, -4.4], // sand filter A
      [-8.9, 0.5, -4.4],
      [-7.9, 0.5, -4.4], // sand filter B
      [-7.9, 2.4, -4.4],
      [-7.0, 2.4, -4.4], // cartridge filter
      [-7.0, 1.0, -4.4],
      [-6.4, 0.95, -3.8],
      [-6.2, 0.95, -3.4], // high-pressure pump suction
      [-6.2, 1.55, -2.9],
      [-8.6, 1.9, -2.5],
      [-11.1, 1.9, -2.4], // feed to the osmosis skid
      [-11.1, 2.5, -0.4], // permeate off the skid
      [-8.2, 2.5, -0.9],
      [-6.5, 2.5, -1.3],
      [-6.2, 1.9, -1.6], // into the treated water tank
    ],
    []
  );
  const waterCurve = usePipeCurve(waterLine);
  const waterStops = [
    { t: 0, color: COLORS.waterRaw },
    { t: 0.32, color: COLORS.waterRaw },
    { t: 0.56, color: COLORS.waterMid },
    { t: 0.8, color: COLORS.waterClean },
    { t: 1, color: COLORS.waterClean },
  ];

  /** treated water leaves the room, crosses the hall and rises to the plant floor */
  const feedLine: Vec3[] = useMemo(
    () => [
      [-6.2, 2.75, -1.6],
      [-6.2, 2.95, -3.5],
      [-1.0, 2.95, -3.5],
      [-1.0, 5.35, -3.5], // up through the builder's opening
      [-1.0, 5.35, -1.4],
      [-0.2, 5.35, -1.4],
      [-0.2, 5.87, -1.4], // make-up connection on the process header
    ],
    []
  );
  const feedCurve = usePipeCurve(feedLine);

  /* ========== 02 · CVC — plant floor west, distribution dropping to the hall ========== */
  const supplyDuct: Vec3[] = useMemo(
    () => [
      [-8.4, 7.25, -3.6],
      [-8.4, 7.6, -3.5],
      [-3.0, 7.6, -3.5],
      [-3.0, VOID0, -3.5], // down through the slab opening
      [4.8, VOID0, -3.5],
    ],
    []
  );
  const returnDuct: Vec3[] = useMemo(
    () => [
      [4.2, VOID0 - 0.3, -1.0],
      [-1.9, VOID0 - 0.3, -1.0],
      [-1.9, VOID0 - 0.3, -3.9],
      [-1.9, 5.7, -3.9], // back up to the air handling unit
      [-6.1, 5.7, -3.9],
    ],
    []
  );
  const branchDuct: Vec3[] = useMemo(
    () => [
      [-3.0, VOID0, -3.5],
      [-6.4, VOID0, -3.5], // ventilation of the water treatment room
    ],
    []
  );
  const supplyCurve = useMemo(
    () => new THREE.CatmullRomCurve3(supplyDuct.map((v) => new THREE.Vector3(...v)), false, 'catmullrom', 0.02),
    [supplyDuct]
  );
  const returnCurve = useMemo(
    () => new THREE.CatmullRomCurve3(returnDuct.map((v) => new THREE.Vector3(...v)), false, 'catmullrom', 0.02),
    [returnDuct]
  );
  const diffuserXs = useMemo(() => (fine ? [-1.8, 1.0, 3.8] : [0.0, 3.4]), [fine]);

  /* ========== 03 · TUYAUTERIE — process rack on the plant floor ========== */
  const processLine: Vec3[] = useMemo(
    () => [
      [0.2, 5.05, -1.4],
      [0.2, 5.87, -1.4],
      [7.6, 5.87, -1.4],
      [7.6, 5.87, -2.6],
    ],
    []
  );
  const utilityLine: Vec3[] = useMemo(
    () => [
      [-0.4, 6.27, -1.4],
      [7.4, 6.27, -1.4],
    ],
    []
  );
  const processCurve = usePipeCurve(processLine);
  const utilityCurve = usePipeCurve(utilityLine);

  /* ========== 04 · CALORIFUGEAGE — heating header under the roof ========== */
  const hotLine: Vec3[] = useMemo(
    () => [
      [-2.0, 6.25, -4.4],
      [-2.0, 7.17, -4.4],
      [-2.0, 7.17, 0.6],
      [8.4, 7.17, 0.6],
      [8.4, 5.6, 0.6],
    ],
    []
  );
  const hotCurve = usePipeCurve(hotLine);
  /** aluminium jacket segments over the clad half of the run */
  const cladX = useMemo(() => (fine ? [3.0, 4.4, 5.8, 7.2] : [3.4, 6.2]), [fine]);
  const bandX = useMemo(() => (fine ? [2.7, 3.7, 5.1, 6.5, 7.9] : []), [fine]);

  /* ========== 05 · PROTECTION INCENDIE — pump room, mains on both levels ========== */
  const fireRiser: Vec3[] = useMemo(
    () => [
      [7.2, 1.3, -3.0],
      [8.8, 1.3, -3.0],
      [8.8, 1.3, -2.8],
      [8.8, 7.7, -2.8],
    ],
    []
  );
  /** the protection covers every room on both levels, not just the hall */
  const BRANCH_Z = useMemo(() => (fine ? [-4.3, -1.6, 1.0, 3.4] : [-4.3, 1.2]), [fine]);
  const HEAD_X = useMemo(
    () => (fine ? [-10.4, -7.6, -4.8, -2.0, 0.8, 3.6, 6.4, 9.2] : [-9.4, -4.4, 0.6, 6.4]),
    [fine]
  );
  const fireCross0: Vec3[] = useMemo(
    () => [
      [8.8, 3.5, BRANCH_Z[0]],
      [8.8, 3.5, BRANCH_Z[BRANCH_Z.length - 1]],
    ],
    [BRANCH_Z]
  );
  const fireCross1: Vec3[] = useMemo(
    () => [
      [8.8, 7.7, BRANCH_Z[0]],
      [8.8, 7.7, BRANCH_Z[BRANCH_Z.length - 1]],
    ],
    [BRANCH_Z]
  );
  const fireRiserCurve = usePipeCurve(fireRiser);
  const fireCross0Curve = usePipeCurve(fireCross0);
  const heads0 = useMemo(
    () => BRANCH_Z.flatMap((z) => HEAD_X.map((x) => [x, z] as [number, number])),
    [BRANCH_Z, HEAD_X]
  );
  const heads1 = heads0;
  const spray: Vec3 = useMemo(() => [HEAD_X[fine ? 3 : 2], 3.3, BRANCH_Z[fine ? 2 : 1]], [HEAD_X, BRANCH_Z, fine]);
  const mainCurve0 = usePipeCurve(
    useMemo(() => [[8.8, 3.5, BRANCH_Z[0]] as Vec3, [-10.8, 3.5, BRANCH_Z[0]] as Vec3], [BRANCH_Z])
  );
  const mainCurve1 = usePipeCurve(
    useMemo(() => [[8.8, 7.7, BRANCH_Z[0]] as Vec3, [-10.8, 7.7, BRANCH_Z[0]] as Vec3], [BRANCH_Z])
  );

  /* ========== 06 · PLOMBERIE — vertical shaft through both levels ========== */
  const coldStack: Vec3[] = useMemo(() => [[10.0, 0.35, 3.5], [10.0, 8.05, 3.5]], []);
  const hotStack: Vec3[] = useMemo(() => [[10.6, 0.85, 3.5], [10.6, 7.85, 3.5]], []);
  const drainStack: Vec3[] = useMemo(
    () => [
      [11.2, 8.1, 3.5],
      [11.2, 0.3, 3.5],
      [10.2, 0.3, 3.5],
      [10.2, 0.3, 4.6],
      [8.5, 0.3, 4.6],
    ],
    []
  );
  const coldCurve = usePipeCurve(coldStack);
  const hotStackCurve = usePipeCurve(hotStack);
  const drainCurve = usePipeCurve(drainStack);

  useFrame((state, delta) => {
    const p = progressRef.current;
    const k = Math.min(1, delta * 3);

    // the shell opens into a cutaway as the camera commits to going inside
    const shellTarget = THREE.MathUtils.clamp(1 - (p - 0.06) / 0.1, 0.06, 1);
    if (facade.current) {
      facade.current.opacity += (shellTarget * 0.34 - facade.current.opacity) * k;
    }
    for (const m of claddingMats.current) {
      if (m) m.opacity += (shellTarget - m.opacity) * k;
    }
    if (roofRef.current) {
      const mat = roofRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity += (shellTarget - mat.opacity) * k;
      roofRef.current.position.y += (L2 + (1 - shellTarget) * 2.4 - roofRef.current.position.y) * k;
    }
  });

  const registerClad = (m: THREE.MeshStandardMaterial | null) => {
    if (m && !claddingMats.current.includes(m)) claddingMats.current.push(m);
  };

  return (
    <group>
      {/* ================================================================
          SHELL AND STRUCTURE
      ================================================================= */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[BW + 1.2, 0.24, BD + 1.2]} />
        <meshStandardMaterial {...MAT.screed} />
      </mesh>

      {/* first-floor slab, pierced by the service openings */}
      {SLAB.map(([ax, bx, az, bz], i) => (
        <mesh key={`sl${i}`} position={[(ax + bx) / 2, L1, (az + bz) / 2]}>
          <boxGeometry args={[bx - ax, SLAB_T, bz - az]} />
          <meshStandardMaterial color="#59606E" metalness={0.02} roughness={0.94} />
        </mesh>
      ))}
      {fine &&
        KERBS.map(([ax, bx, az, bz], i) => (
          <mesh key={`kb${i}`} position={[(ax + bx) / 2, F1 + 0.07, (az + bz) / 2]}>
            <boxGeometry args={[bx - ax, 0.14, bz - az]} />
            <meshStandardMaterial color="#6B7280" metalness={0.02} roughness={0.92} />
          </mesh>
        ))}

      {/* roof — lifts away as the cutaway opens */}
      <mesh ref={roofRef} position={[0, L2, 0]}>
        <boxGeometry args={[BW, 0.3, BD]} />
        <meshStandardMaterial color="#646B79" metalness={0.02} roughness={0.94} transparent opacity={1} />
      </mesh>

      {[-11, -5.5, 0, 5.5, 11].map((x) =>
        [-5, 0, 5].map((z) => (
          <group key={`col${x}:${z}`}>
            <mesh position={[x, L1 / 2, z]}>
              <boxGeometry args={[0.34, L1, 0.34]} />
              <meshStandardMaterial {...MAT.steelColumn} />
            </mesh>
            <mesh position={[x, F1 + (L2 - F1) / 2, z]}>
              <boxGeometry args={[0.3, L2 - F1, 0.3]} />
              <meshStandardMaterial {...MAT.steelColumn} />
            </mesh>
          </group>
        ))
      )}
      {fine &&
        [-8, -2.5, 3, 8.5].map((x) => (
          <mesh key={`b${x}`} position={[x, CEIL1 - 0.3, 0]}>
            <boxGeometry args={[0.22, 0.55, BD]} />
            <meshStandardMaterial {...MAT.steelColumn} />
          </mesh>
        ))}

      {/* rear and west walls stay solid so the rooms read as rooms */}
      <mesh position={[0, L2 / 2, Z0 - 0.15]}>
        <boxGeometry args={[BW, L2, 0.3]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <mesh position={[X0 - 0.15, L2 / 2, 0]}>
        <boxGeometry args={[0.3, L2, BD]} />
        <meshStandardMaterial {...MAT.cladding} />
      </mesh>

      {/* glazed facade — fades to open the cutaway */}
      <mesh position={[0, L2 / 2, Z1 + 0.1]}>
        <boxGeometry args={[BW, L2, 0.08]} />
        <meshStandardMaterial
          ref={facade}
          color="#9FB6D4"
          metalness={0.25}
          roughness={0.08}
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <mesh key={`ml${x}`} position={[x, L2 / 2, Z1 + 0.12]}>
          <boxGeometry args={[0.12, L2, 0.16]} />
          <meshStandardMaterial ref={registerClad} {...MAT.cladding} transparent opacity={1} />
        </mesh>
      ))}
      <mesh position={[0, L1, Z1 + 0.12]}>
        <boxGeometry args={[BW, 0.36, 0.2]} />
        <meshStandardMaterial ref={registerClad} {...MAT.cladding} transparent opacity={1} />
      </mesh>

      {/* ---- partition walls: the rooms ---- */}
      {/* P1 — water treatment room, with a doorway into the hall */}
      <mesh position={[-4.8, CEIL0 / 2, -2.4]}>
        <boxGeometry args={[0.22, CEIL0, 7.2]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <mesh position={[-4.8, CEIL0 / 2, 4.6]}>
        <boxGeometry args={[0.22, CEIL0, 2.8]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <mesh position={[-4.8, 3.17, 2.2]}>
        <boxGeometry args={[0.22, 1.73, 2.0]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <DoorFrame x={-4.8} z={2.2} width={2.0} height={2.3} axis="z" />
      <RoomSign x={-4.66} y={2.75} z={0.9} axis="x" />

      {/* P2 + S2 — fire pump room */}
      <mesh position={[5.8, CEIL0 / 2, -3.3]}>
        <boxGeometry args={[0.22, CEIL0, 5.4]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <mesh position={[5.8, 3.17, 0.0]}>
        <boxGeometry args={[0.22, 1.73, 1.2]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>
      <DoorFrame x={5.8} z={0.0} width={1.2} height={2.3} axis="z" />
      <RoomSign x={5.66} y={2.75} z={1.3} axis="x" />
      <mesh position={[8.9, CEIL0 / 2, 0.6]}>
        <boxGeometry args={[6.4, CEIL0, 0.22]} />
        <meshStandardMaterial {...MAT.concreteWall} />
      </mesh>

      {/* ---- vertical circulation ---- */}
      <Stair x={3.8} width={1.5} zBottom={5.9} zTop={0.25} top={F1} steps={fine ? 20 : 13} />

      {/* ---- plant floor edge protection ---- */}
      <Rail from={[-11.4, 5.5]} to={[8.6, 5.5]} y={F1} dense={fine} />
      <Rail from={[2.35, 0.9]} to={[2.35, 4.7]} y={F1} dense={fine} />
      <Rail from={[5.25, 0.9]} to={[5.25, 4.7]} y={F1} dense={fine} />
      <Rail from={[2.4, 4.72]} to={[5.2, 4.72]} y={F1} dense={fine} />
      {fine && <Rail from={[9.25, 2.4]} to={[9.25, 4.7]} y={F1} dense={fine} />}

      {/* ================================================================
          01 · TRAITEMENT DES EAUX — its own room, ground floor west
      ================================================================= */}
      <group>
        {/* coated, bunded floor */}
        <mesh position={[-8.4, 0.05, -1.6]}>
          <boxGeometry args={[7.0, 0.1, 8.6]} />
          <meshStandardMaterial color="#2F4658" metalness={0.06} roughness={0.5} />
        </mesh>
        {/* retention bund around the chemical dosing station */}
        {fine &&
          ([
            [-10.95, 0.12, 3.05, 2.6, 0.24, 0.1],
            [-10.95, 0.12, 1.35, 2.6, 0.24, 0.1],
            [-12.15, 0.12, 2.2, 0.1, 0.24, 1.8],
            [-9.75, 0.12, 2.2, 0.1, 0.24, 1.8],
          ] as [number, number, number, number, number, number][]).map((b, i) => (
            <mesh key={`bd${i}`} position={[b[0], b[1], b[2]]}>
              <boxGeometry args={[b[3], b[4], b[5]]} />
              <meshStandardMaterial color="#3C596B" roughness={0.6} />
            </mesh>
          ))}

        {/* rear row: raw storage, media filters, cartridge filter, high-pressure pump */}
        <Tank
          position={[-10.6, 1.45, -4.4] as Vec3}
          radius={0.95}
          height={2.6}
          mat={{ color: '#48536B', metalness: 0.4, roughness: 0.55 }}
        />
        <FilterVessel position={[-8.9, 1.35, -4.4]} radius={0.5} height={2.0} color="#2F6F8F" />
        <FilterVessel position={[-7.9, 1.35, -4.4]} radius={0.5} height={2.0} color="#33788F" />
        <FilterVessel position={[-7.0, 1.05, -4.4]} radius={0.26} height={1.4} color="#3B7F94" />
        <mesh position={[-6.2, 0.14, -3.2]}>
          <boxGeometry args={[1.7, 0.28, 1.4]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>
        <Pump position={[-6.2, 0.66, -3.2]} running scale={0.95} color={MAT.paintedNavy.color} />

        {/* reverse-osmosis skid, set against the west wall */}
        <group position={[-11.1, 1.9, -1.4]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, -0.78, 0]}>
            <boxGeometry args={[2.6, 0.12, 1.0]} />
            <meshStandardMaterial {...MAT.paintedDark} />
          </mesh>
          {[-1.2, 1.2].map((x) => (
            <mesh key={x} position={[x, -0.2, 0]}>
              <boxGeometry args={[0.1, 1.28, 0.1]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          ))}
          {[0.42, 0.1, -0.22].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.15, 2.5, seg]} />
              <meshStandardMaterial color="#E9EDF5" metalness={0.12} roughness={0.34} />
            </mesh>
          ))}
          {fine && (
            <mesh position={[1.32, 0.36, 0.04]}>
              <boxGeometry args={[0.14, 0.5, 0.4]} />
              <meshStandardMaterial {...MAT.paintedNavy} />
            </mesh>
          )}
        </group>

        {/* treated water storage */}
        <Tank position={[-6.2, 1.35, -1.6] as Vec3} radius={0.66} height={2.4} mat={MAT.stainless} />

        {/* chemical dosing station */}
        {fine &&
          [-11.5, -10.4].map((x) => (
            <group key={`ds${x}`}>
              <Tank position={[x, 0.62, 2.2] as Vec3} radius={0.28} height={1.0} mat={MAT.pvcGrey} legs={false} />
              <mesh position={[x, 1.24, 2.2]}>
                <boxGeometry args={[0.22, 0.26, 0.22]} />
                <meshStandardMaterial {...MAT.paintedOrange} />
              </mesh>
            </group>
          ))}

        {/* control cabinet against the west wall */}
        <mesh position={[-11.5, 1.05, 4.0]}>
          <boxGeometry args={[0.45, 2.1, 1.7]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        <mesh position={[-11.26, 1.45, 4.0]}>
          <boxGeometry args={[0.02, 0.5, 0.9]} />
          <meshStandardMaterial color="#2FBF71" emissive="#2FBF71" emissiveIntensity={0.45} />
        </mesh>

        <PipeRun points={waterLine} radius={0.085} mat={MAT.stainless} />
        <LiquidFlow curve={waterCurve} radius={0.085} colorStops={waterStops} active speed={0.16} />

        {/* the product water leaves the room and climbs to the plant floor */}
        <PipeRun points={feedLine} radius={0.07} mat={MAT.stainless} />
        {fine && <Valve position={[-1.0, 4.9, -3.5]} rotation={[0, 0, Math.PI / 2]} open={1} scale={0.62} />}
        <LiquidFlow curve={feedCurve} radius={0.07} color={COLORS.waterClean} active speed={0.24} />
      </group>

      {/* ================================================================
          02 · CVC — plant floor west, distribution dropping into the hall
      ================================================================= */}
      <group>
        <mesh position={[-8.4, F1 + 0.09, -3.6]}>
          <boxGeometry args={[6.6, 0.18, 3.2]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>

        {/* air handling unit */}
        <mesh position={[-8.4, F1 + 1.45, -3.6]}>
          <boxGeometry args={[4.8, 2.5, 2.5]} />
          <meshStandardMaterial {...MAT.galva} />
        </mesh>
        {fine &&
          [-1.5, 0, 1.5].map((x) => (
            <group key={`ap${x}`}>
              <mesh position={[-8.4 + x, F1 + 1.4, -2.34]}>
                <boxGeometry args={[1.3, 1.7, 0.03]} />
                <meshStandardMaterial {...MAT.paintedNavy} />
              </mesh>
              <mesh position={[-8.4 + x + 0.5, F1 + 1.4, -2.31]}>
                <boxGeometry args={[0.06, 0.22, 0.06]} />
                <meshStandardMaterial {...MAT.brushedSteel} />
              </mesh>
            </group>
          ))}
        <mesh position={[-9.9, F1 + 2.42, -2.34]}>
          <boxGeometry args={[1.2, 0.1, 0.03]} />
          <meshStandardMaterial {...MAT.paintedOrange} />
        </mesh>
        {/* fresh-air louvres in the rear wall */}
        {fine &&
          [-0.45, -0.15, 0.15, 0.45].map((y) => (
            <mesh key={`lv${y}`} position={[-8.4, F1 + 1.7 + y, -5.82]} rotation={[Math.PI / 12, 0, 0]}>
              <boxGeometry args={[2.6, 0.12, 0.07]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          ))}
        {/* discharge collar and fan */}
        <mesh position={[-8.4, F1 + 2.85, -3.6]}>
          <cylinderGeometry args={[0.46, 0.5, 0.24, seg]} />
          <meshStandardMaterial {...MAT.galva} />
        </mesh>
        <AxialFan position={[-8.4, F1 + 3.08, -3.6]} rotation={[-Math.PI / 2, 0, 0]} radius={0.42} running color={COLORS.orange} />

        {/* chilled water production */}
        <mesh position={[-4.4, F1 + 1.0, -4.3]}>
          <boxGeometry args={[2.4, 2.0, 1.9]} />
          <meshStandardMaterial {...MAT.paintedNavy} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <AxialFan
            key={`cf${x}`}
            position={[-4.4 + x, F1 + 2.08, -4.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            radius={0.38}
            running
            color="#9FB6D4"
          />
        ))}
        {fine &&
          [-0.75, -0.25, 0.25, 0.75].map((z) => (
            <mesh key={`fin${z}`} position={[-3.16, F1 + 1.0, -4.3 + z]}>
              <boxGeometry args={[0.04, 1.6, 0.3]} />
              <meshStandardMaterial {...MAT.aluJacket} />
            </mesh>
          ))}
        {/* chilled water pipes back to the air handling unit */}
        <PipeRun
          points={[
            [-5.5, F1 + 1.6, -4.0],
            [-6.4, F1 + 1.6, -4.0],
            [-6.4, F1 + 1.3, -4.0],
          ]}
          radius={0.075}
          mat={COLD_BLUE}
        />
        <PipeRun
          points={[
            [-5.5, F1 + 1.85, -4.0],
            [-6.4, F1 + 1.85, -4.0],
            [-6.4, F1 + 1.55, -4.0],
          ]}
          radius={0.06}
          mat={HOT_ORANGE}
        />

        {/* heat exchanger — the source of the calorifuged header */}
        <mesh position={[-2.0, F1 + 0.95, -4.4]}>
          <boxGeometry args={[1.6, 1.9, 1.4]} />
          <meshStandardMaterial {...MAT.paintedNavy} />
        </mesh>
        <mesh position={[-2.0, F1 + 1.55, -3.68]}>
          <boxGeometry args={[1.1, 0.12, 0.04]} />
          <meshStandardMaterial {...MAT.paintedOrange} />
        </mesh>

        <DuctRun points={supplyDuct} width={0.78} height={0.54} />
        <DuctRun points={returnDuct} width={0.64} height={0.46} mat={MAT.pvcGrey} />
        {fine && <DuctRun points={branchDuct} width={0.4} height={0.32} />}
        {diffuserXs.map((x) => (
          <group key={`df${x}`}>
            <DuctRun
              points={[
                [x, VOID0, -3.5],
                [x, VOID0 - 0.5, -3.5],
              ]}
              width={0.36}
              height={0.3}
            />
            <mesh position={[x, VOID0 - 0.6, -3.5]}>
              <boxGeometry args={[0.62, 0.07, 0.62]} />
              <meshStandardMaterial {...MAT.paintedNavy} />
            </mesh>
            <mesh position={[x, VOID0 - 0.66, -3.5]}>
              <boxGeometry args={[0.48, 0.04, 0.48]} />
              <meshStandardMaterial color="#DDE3EE" metalness={0.35} roughness={0.5} />
            </mesh>
          </group>
        ))}
        {fine && (
          <group>
            <mesh position={[-6.4, VOID0 - 0.24, -3.5]}>
              <boxGeometry args={[0.5, 0.06, 0.5]} />
              <meshStandardMaterial color="#DDE3EE" metalness={0.35} roughness={0.5} />
            </mesh>
          </group>
        )}
        <AirStream curve={supplyCurve} count={fine ? 66 : 32} color={COLORS.airCool} active speed={0.19} spread={0.19} width={0.03} length={0.78} />
        {fine && <AirStream curve={returnCurve} count={40} color="#93A8CE" active speed={0.13} spread={0.15} width={0.026} length={0.6} opacity={0.4} />}
      </group>

      {/* ================================================================
          03 · TUYAUTERIE — process rack, plant floor centre
      ================================================================= */}
      <group>
        {/* walkway plate along the rack */}
        {fine && (
          <mesh position={[3.6, F1 + 0.03, 0.4]}>
            <boxGeometry args={[8.4, 0.06, 1.6]} />
            <meshStandardMaterial color="#7B8494" metalness={0.5} roughness={0.62} />
          </mesh>
        )}
        {[2.6, 4.6, 6.6].map((x) => (
          <group key={`rack${x}`}>
            {[-2.2, -0.6].map((z) => (
              <mesh key={z} position={[x, F1 + 1.1, z]}>
                <boxGeometry args={[0.12, 2.2, 0.12]} />
                <meshStandardMaterial {...MAT.paintedNavy} />
              </mesh>
            ))}
            {[5.87, 6.27].map((y) => (
              <mesh key={y} position={[x, y + 0.16, -1.4]}>
                <boxGeometry args={[0.12, 0.1, 1.6]} />
                <meshStandardMaterial {...MAT.paintedNavy} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0.9, F1 + 0.12, -1.4]}>
          <boxGeometry args={[2.8, 0.24, 1.6]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>
        <Pump position={[0.2, F1 + 0.66, -1.4]} running scale={1.15} />
        <Pump position={[1.7, F1 + 0.66, -1.4]} running={false} scale={1.15} color={MAT.paintedNavy.color} />
        <PipeRun points={processLine} radius={0.16} mat={MAT.brushedSteel} flangeEvery={1} />
        <PipeRun points={utilityLine} radius={0.1} mat={MAT.stainless} flangeEvery={1} />
        <Valve position={[3.6, 5.87, -1.4]} open={1} scale={1.25} />
        {fine && <Valve position={[6.2, 6.27, -1.4]} open={0.55} scale={0.9} />}
        <Gauge position={[5.4, 6.27, -1.4]} value={0.6} scale={1.15} />
        <LiquidFlow curve={processCurve} radius={0.16} color={COLORS.orange} active speed={0.26} />
        {fine && <LiquidFlow curve={utilityCurve} radius={0.1} color="#7FD8F0" active speed={0.2} />}
      </group>

      {/* ================================================================
          04 · CALORIFUGEAGE — bare, lagged, then clad, in that order
      ================================================================= */}
      <group>
        <PipeRun
          points={hotLine}
          radius={0.13}
          mat={{ color: '#BDB6AC', metalness: 0.55, roughness: 0.46, emissive: COLORS.hot, emissiveIntensity: 0.07 }}
        />
        {/* rock wool over everything east of the exchanger take-off */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[4.4, 7.17, 0.6]}>
          <cylinderGeometry args={[0.22, 0.22, 8.0, seg]} />
          <meshStandardMaterial {...MAT.rockwool} />
        </mesh>
        {/* aluminium jacket over the finished half only — the cut-away teaches the build-up */}
        {cladX.map((x) => (
          <mesh key={`cl${x}`} rotation={[0, 0, Math.PI / 2]} position={[x, 7.17, 0.6]}>
            <cylinderGeometry args={[0.25, 0.25, 1.34, seg]} />
            <CladdingMaterial focusRef={focusRef} />
          </mesh>
        ))}
        {bandX.map((x) => (
          <mesh key={`bn${x}`} rotation={[0, 0, Math.PI / 2]} position={[x, 7.17, 0.6]}>
            <cylinderGeometry args={[0.26, 0.26, 0.06, seg]} />
            <meshStandardMaterial {...MAT.stainless} />
          </mesh>
        ))}
        {/* hangers off the roof structure */}
        {[-0.4, 1.6, 3.6, 5.6, 7.6].map((x) => (
          <mesh key={`hg${x}`} position={[x, 7.62, 0.6]}>
            <boxGeometry args={[0.06, 0.62, 0.06]} />
            <meshStandardMaterial {...MAT.steelColumn} />
          </mesh>
        ))}
        {/* the header lands on a branch manifold */}
        <mesh position={[8.4, 5.35, 0.6]}>
          <boxGeometry args={[0.3, 0.9, 0.3]} />
          <meshStandardMaterial {...MAT.brushedSteel} />
        </mesh>
        {fine &&
          [5.15, 5.55].map((y) => (
            <Valve key={`mv${y}`} position={[8.4, y, 0.9]} rotation={[Math.PI / 2, 0, 0]} open={1} scale={0.55} />
          ))}
        <LiquidFlow curve={hotCurve} radius={0.13} color={COLORS.hot} active speed={0.2} opacity={0.85} />
      </group>

      {/* ================================================================
          05 · PROTECTION INCENDIE — pump room below, mains on both levels
      ================================================================= */}
      <group>
        <mesh position={[9.0, 0.05, -2.8]}>
          <boxGeometry args={[6.0, 0.1, 6.2]} />
          <meshStandardMaterial color="#4A4048" metalness={0.03} roughness={0.85} />
        </mesh>
        <Tank
          position={[10.4, 1.65, -4.2] as Vec3}
          radius={1.15}
          height={2.9}
          mat={{ color: '#A63A24', metalness: 0.35, roughness: 0.52 }}
        />
        {/* base ring, manway, level gauge and top nozzles */}
        <mesh position={[10.4, 0.28, -4.2]}>
          <cylinderGeometry args={[1.24, 1.24, 0.16, seg]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        {fine && (
          <group>
            <mesh position={[10.4, 2.35, -3.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.08, seg]} />
              <meshStandardMaterial color="#7E2E1E" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[10.4, 2.35, -3.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.03, seg]} />
              <meshStandardMaterial {...MAT.brushedSteel} />
            </mesh>
            <mesh position={[9.5, 1.6, -3.2]}>
              <boxGeometry args={[0.06, 2.0, 0.06]} />
              <meshStandardMaterial {...MAT.stainless} />
            </mesh>
            <mesh position={[9.5, 2.1, -3.17]}>
              <boxGeometry args={[0.08, 0.9, 0.03]} />
              <meshStandardMaterial color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={0.4} />
            </mesh>
            {[-0.4, 0.4].map((o) => (
              <mesh key={`nz${o}`} position={[10.4 + o, 3.2, -4.2]}>
                <cylinderGeometry args={[0.12, 0.12, 0.24, 12]} />
                <meshStandardMaterial {...MAT.brushedSteel} />
              </mesh>
            ))}
            <mesh position={[10.4, 1.9, -3.06]}>
              <boxGeometry args={[0.6, 0.28, 0.02]} />
              <meshStandardMaterial {...MAT.paintedDark} />
            </mesh>
          </group>
        )}
        <mesh position={[7.4, 0.14, -2.4]}>
          <boxGeometry args={[2.4, 0.28, 2.6]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>
        <Pump position={[7.2, 0.72, -3.0] as Vec3} running color="#C4331F" scale={1.05} />
        <Pump position={[7.2, 0.66, -1.7] as Vec3} running={false} color="#C4331F" scale={0.7} />
        <mesh position={[6.4, 1.0, -4.6]}>
          <boxGeometry args={[0.5, 2.0, 0.9]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        <mesh position={[6.66, 1.4, -4.6]}>
          <boxGeometry args={[0.02, 0.44, 0.5]} />
          <meshStandardMaterial color="#2FBF71" emissive="#2FBF71" emissiveIntensity={0.5} />
        </mesh>
        {fine && (
          <mesh position={[6.66, 0.9, -4.6]}>
            <boxGeometry args={[0.02, 0.16, 0.5]} />
            <meshStandardMaterial color="#C4331F" emissive="#C4331F" emissiveIntensity={0.4} />
          </mesh>
        )}

        <PipeRun points={fireRiser} radius={0.13} mat={FIRE_RED} flangeEvery={2} />
        <Gauge position={[7.9, 2.3, -3.0]} value={0.78} scale={1.1} />

        {/* distribution mains: a cross main at each level feeding branch lines
            that run the whole length of the building, over every room */}
        <PipeRun points={fireCross0} radius={0.11} mat={FIRE_RED} flangeEvery={3} />
        <PipeRun points={fireCross1} radius={0.11} mat={FIRE_RED} flangeEvery={3} />
        {BRANCH_Z.map((z) => (
          <group key={`fb${z}`}>
            <PipeRun points={[[8.8, 3.5, z], [-10.8, 3.5, z]]} radius={0.055} mat={FIRE_RED} flangeEvery={6} />
            <PipeRun points={[[8.8, 7.7, z], [-10.8, 7.7, z]]} radius={0.055} mat={FIRE_RED} flangeEvery={6} />
            {fine &&
              [-9.6, -4.0, 1.6, 7.2].map((x) => (
                <group key={`fh${z}:${x}`}>
                  <mesh position={[x, 3.86, z]}>
                    <boxGeometry args={[0.05, 0.36, 0.05]} />
                    <meshStandardMaterial {...MAT.steelColumn} />
                  </mesh>
                  <mesh position={[x, 8.06, z]}>
                    <boxGeometry args={[0.05, 0.36, 0.05]} />
                    <meshStandardMaterial {...MAT.steelColumn} />
                  </mesh>
                </group>
              ))}
          </group>
        ))}
        <SprinklerGrid heads={heads0} y={3.35} mainY={3.5} />
        <SprinklerGrid heads={heads1} y={7.55} mainY={7.7} />
        <SprayCone position={spray} active count={fine ? 56 : 26} height={2.9} radiusBottom={1.05} />

        <LiquidFlow curve={fireRiserCurve} radius={0.13} color={COLORS.cold} active speed={0.3} />
        <LiquidFlow curve={fireCross0Curve} radius={0.11} color={COLORS.cold} active speed={0.26} />
        <LiquidFlow curve={mainCurve0} radius={0.055} color={COLORS.cold} active speed={0.22} />
        {fine && <LiquidFlow curve={mainCurve1} radius={0.055} color={COLORS.cold} active speed={0.22} />}
      </group>

      {/* ================================================================
          06 · PLOMBERIE — shaft, sanitary block and calorifier
      ================================================================= */}
      <group>
        {/* shaft enclosure — two sides, so the stacks stay readable */}
        <mesh position={[11.87, L2 / 2 - 0.2, 3.5]}>
          <boxGeometry args={[0.16, L2 - 0.4, 2.4]} />
          <meshStandardMaterial {...MAT.concreteWall} />
        </mesh>
        <mesh position={[10.5, L2 / 2 - 0.2, 2.28]}>
          <boxGeometry args={[2.6, L2 - 0.4, 0.16]} />
          <meshStandardMaterial {...MAT.concreteWall} />
        </mesh>

        <PipeRun points={coldStack} radius={0.075} mat={COLD_BLUE} />
        <PipeRun points={hotStack} radius={0.06} mat={HOT_ORANGE} />
        <PipeRun points={drainStack} radius={0.11} mat={MAT.pvcDark} />

        {[1.5, 5.9].map((y) => (
          <group key={`br${y}`}>
            <PipeRun
              points={[
                [10.0, y, 3.5],
                [10.0, y, 4.4],
                [8.6, y, 4.4],
              ]}
              radius={0.05}
              mat={COLD_BLUE}
            />
            <PipeRun
              points={[
                [10.6, y + 0.3, 3.5],
                [10.6, y + 0.3, 4.7],
                [8.8, y + 0.3, 4.7],
              ]}
              radius={0.042}
              mat={HOT_ORANGE}
            />
            {fine && <Valve position={[9.3, y, 4.4]} rotation={[0, Math.PI / 2, 0]} open={1} scale={0.6} />}
          </group>
        ))}

        {/* sanitary block on the ground floor — half-height partitions */}
        <mesh position={[6.6, 1.3, 4.3]}>
          <boxGeometry args={[0.14, 2.6, 2.6]} />
          <meshStandardMaterial {...MAT.concreteWall} />
        </mesh>
        <mesh position={[7.85, 1.3, 3.0]}>
          <boxGeometry args={[2.5, 2.6, 0.14]} />
          <meshStandardMaterial {...MAT.concreteWall} />
        </mesh>
        {[7.2, 8.0].map((x) => (
          <group key={`bs${x}`}>
            <mesh position={[x, 0.85, 3.28]}>
              <boxGeometry args={[0.52, 0.14, 0.42]} />
              <meshStandardMaterial color="#EDF1F7" metalness={0.05} roughness={0.28} />
            </mesh>
            {fine && (
              <mesh position={[x, 1.02, 3.14]}>
                <cylinderGeometry args={[0.025, 0.025, 0.26, 10]} />
                <meshStandardMaterial {...MAT.stainless} />
              </mesh>
            )}
          </group>
        ))}
        {fine && (
          <group>
            <mesh position={[6.95, 0.2, 4.9]}>
              <boxGeometry args={[0.36, 0.4, 0.56]} />
              <meshStandardMaterial color="#EDF1F7" metalness={0.05} roughness={0.28} />
            </mesh>
            <mesh position={[6.75, 0.62, 4.9]}>
              <boxGeometry args={[0.14, 0.44, 0.5]} />
              <meshStandardMaterial color="#EDF1F7" metalness={0.05} roughness={0.28} />
            </mesh>
          </group>
        )}

        {/* stored hot water, lagged like everything else that runs hot */}
        <mesh position={[8.5, 0.2, 4.15]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, seg]} />
          <meshStandardMaterial {...MAT.concrete} />
        </mesh>
        <Tank position={[8.5, 1.2, 4.15] as Vec3} radius={0.42} height={1.5} mat={MAT.rockwool} legs={false} />
        {fine &&
          [0.8, 1.2, 1.6].map((y) => (
            <mesh key={`cb${y}`} position={[8.5, y, 4.15]}>
              <cylinderGeometry args={[0.44, 0.44, 0.05, seg]} />
              <meshStandardMaterial {...MAT.aluJacket} />
            </mesh>
          ))}

        <LiquidFlow curve={coldCurve} radius={0.075} color={COLORS.cold} active speed={0.24} />
        <LiquidFlow curve={hotStackCurve} radius={0.06} color={COLORS.airWarm} active speed={0.2} />
        {fine && <LiquidFlow curve={drainCurve} radius={0.11} color="#93A2C4" active speed={0.3} opacity={0.75} />}
      </group>

      {/* ================================================================
          THE SERVED HALL — what all of the plant above is actually for
      ================================================================= */}
      <group>
        {/* marked pedestrian route from the plant-room doors to the stair */}
        {[-3.7, -1.3].map((x) => (
          <mesh key={`fl${x}`} position={[x, 0.02, 0.2]}>
            <boxGeometry args={[0.12, 0.04, 10.4]} />
            <meshStandardMaterial color="#C8761F" roughness={0.75} />
          </mesh>
        ))}
        {fine && (
          <mesh position={[-2.5, 0.02, 5.0]}>
            <boxGeometry args={[2.4, 0.04, 0.12]} />
            <meshStandardMaterial color="#C8761F" roughness={0.75} />
          </mesh>
        )}
        {/* distribution board on the hall face of the water treatment wall */}
        <mesh position={[-4.6, 1.35, -4.0]}>
          <boxGeometry args={[0.18, 1.8, 1.2]} />
          <meshStandardMaterial {...MAT.paintedDark} />
        </mesh>
        <mesh position={[-4.5, 1.85, -4.0]}>
          <boxGeometry args={[0.02, 0.16, 0.9]} />
          <meshStandardMaterial color="#2FBF71" emissive="#2FBF71" emissiveIntensity={0.4} />
        </mesh>
        {/* hose reel cabinet, dropped off the sprinkler main overhead */}
        <mesh position={[-4.6, 1.25, -1.0]}>
          <boxGeometry args={[0.2, 0.85, 0.85]} />
          <meshStandardMaterial {...MAT.paintedRed} />
        </mesh>
        <PipeRun
          points={[
            [-4.2, 3.5, -2.8],
            [-4.2, 3.5, -1.0],
            [-4.45, 1.7, -1.0],
          ]}
          radius={0.045}
          mat={FIRE_RED}
        />
      </group>

      {/* ---------- luminaires ---------- */}
      {fine &&
        [-9, -3.5, 2, 7].map((x) => (
          <mesh key={`l0${x}`} position={[x, CEIL0 - 0.14, 2.4]}>
            <boxGeometry args={[1.5, 0.06, 0.18]} />
            <meshStandardMaterial color="#E9EDF5" emissive="#DDE7FF" emissiveIntensity={0.55} />
          </mesh>
        ))}
      {fine &&
        [-8, -2.5, 3, 8.5].map((x) => (
          <mesh key={`l1${x}`} position={[x, CEIL1 - 0.62, 2.4]}>
            <boxGeometry args={[0.18, 0.06, 1.5]} />
            <meshStandardMaterial color="#E9EDF5" emissive="#DDE7FF" emissiveIntensity={0.55} />
          </mesh>
        ))}

      <pointLight position={[-8.6, 3.1, -2.2]} intensity={30} distance={17} color="#dbe6ff" />
      <pointLight position={[9.0, 2.8, -2.6]} intensity={22} distance={14} color="#ffd8c6" />
      <pointLight position={[9.2, 2.9, 4.4]} intensity={26} distance={13} color="#dbe6ff" />
      <pointLight position={[-7.0, 6.6, -2.6]} intensity={26} distance={16} color="#dbe6ff" />
      <pointLight position={[3.4, 6.6, -1.0]} intensity={24} distance={15} color="#dbe6ff" />
      {fine && <pointLight position={[1.0, 2.6, 2.6]} intensity={18} distance={14} color="#dbe6ff" />}
      {fine && <pointLight position={[-9.4, 2.4, 3.0]} intensity={16} distance={12} color="#dbe6ff" />}
      {fine && <pointLight position={[6.0, 6.8, 1.4]} intensity={14} distance={12} color="#ffd8c6" />}
    </group>
  );
}

/* ================================================================
   small architectural helpers
================================================================= */

/** Aluminium jacket that turns semi-transparent while calorifugeage is the focused trade. */
function CladdingMaterial({ focusRef }: { focusRef: MutableRefObject<number> }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = focusRef.current === 4 ? 0.22 : 1;
    ref.current.opacity += (target - ref.current.opacity) * Math.min(1, delta * 3);
  });
  return <meshStandardMaterial ref={ref} {...MAT.aluJacket} transparent opacity={1} depthWrite />;
}

/** Painted frame around a doorway in a partition. */
function DoorFrame({
  x,
  z,
  width,
  height,
  axis,
}: {
  x: number;
  z: number;
  width: number;
  height: number;
  axis: 'x' | 'z';
}) {
  const half = width / 2;
  const t = 0.08;
  return (
    <group>
      {[-half, half].map((o) => (
        <mesh key={o} position={axis === 'z' ? [x, height / 2, z + o] : [x + o, height / 2, z]}>
          <boxGeometry args={axis === 'z' ? [0.26, height, t] : [t, height, 0.26]} />
          <meshStandardMaterial {...MAT.paintedNavy} />
        </mesh>
      ))}
      <mesh position={[x, height, z]}>
        <boxGeometry args={axis === 'z' ? [0.26, t, width] : [width, t, 0.26]} />
        <meshStandardMaterial {...MAT.paintedNavy} />
      </mesh>
    </group>
  );
}

/** Room identification plate — a navy plate with the house orange bar. */
function RoomSign({ x, y, z, axis }: { x: number; y: number; z: number; axis: 'x' | 'z' }) {
  const flat = axis === 'x' ? ([0.02, 0.34, 0.72] as [number, number, number]) : ([0.72, 0.34, 0.02] as [number, number, number]);
  const bar = axis === 'x' ? ([0.03, 0.07, 0.72] as [number, number, number]) : ([0.72, 0.07, 0.03] as [number, number, number]);
  return (
    <group>
      <mesh position={[x, y, z]}>
        <boxGeometry args={flat} />
        <meshStandardMaterial {...MAT.paintedDark} />
      </mesh>
      <mesh position={[x, y - 0.12, z]}>
        <boxGeometry args={bar} />
        <meshStandardMaterial {...MAT.paintedOrange} />
      </mesh>
    </group>
  );
}

/** Axis-aligned edge protection: two rails, posts and a toe board. */
function Rail({
  from,
  to,
  y,
  dense = true,
}: {
  from: [number, number];
  to: [number, number];
  y: number;
  dense?: boolean;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const cx = (from[0] + to[0]) / 2;
  const cz = (from[1] + to[1]) / 2;
  const alongX = Math.abs(dx) >= Math.abs(dz);
  const n = Math.max(2, Math.round(len / (dense ? 1.8 : 3.0)) + 1);
  return (
    <group>
      {[1.1, 0.56].map((h) => (
        <mesh key={h} position={[cx, y + h, cz]}>
          <boxGeometry args={[alongX ? len : 0.05, 0.05, alongX ? 0.05 : len]} />
          <meshStandardMaterial {...MAT.galva} />
        </mesh>
      ))}
      {Array.from({ length: n }, (_, i) => i / (n - 1)).map((t, i) => (
        <mesh key={`p${i}`} position={[from[0] + dx * t, y + 0.57, from[1] + dz * t]}>
          <boxGeometry args={[0.06, 1.14, 0.06]} />
          <meshStandardMaterial {...MAT.galva} />
        </mesh>
      ))}
      {dense && (
        <mesh position={[cx, y + 0.08, cz]}>
          <boxGeometry args={[alongX ? len : 0.04, 0.14, alongX ? 0.04 : len]} />
          <meshStandardMaterial {...MAT.paintedOrange} />
        </mesh>
      )}
    </group>
  );
}

/** Straight industrial access stair between the two levels. */
function Stair({
  x,
  width,
  zBottom,
  zTop,
  top,
  steps,
}: {
  x: number;
  width: number;
  zBottom: number;
  zTop: number;
  top: number;
  steps: number;
}) {
  const run = zBottom - zTop;
  const rise = top / steps;
  const going = run / steps;
  const angle = Math.atan2(top, run);
  const stringerLen = Math.hypot(top, run);
  const half = width / 2;
  return (
    <group>
      {Array.from({ length: steps }, (_, i) => i).map((i) => (
        <group key={`st${i}`}>
          <mesh position={[x, (i + 1) * rise - 0.03, zBottom - (i + 0.5) * going]}>
            <boxGeometry args={[width, 0.06, going * 0.96]} />
            <meshStandardMaterial color="#7B8494" metalness={0.5} roughness={0.62} />
          </mesh>
        </group>
      ))}
      {[-half, half].map((o) => (
        <group key={`sg${o}`}>
          <mesh position={[x + o, top / 2, (zBottom + zTop) / 2]} rotation={[angle, 0, 0]}>
            <boxGeometry args={[0.08, 0.3, stringerLen]} />
            <meshStandardMaterial {...MAT.paintedNavy} />
          </mesh>
          <mesh position={[x + o, top / 2 + 1.0, (zBottom + zTop) / 2]} rotation={[Math.PI / 2 + angle, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, stringerLen, 8]} />
            <meshStandardMaterial {...MAT.galva} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
