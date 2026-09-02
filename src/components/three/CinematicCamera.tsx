'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

export type Waypoint = {
  /** camera position */
  pos: [number, number, number];
  /** what the camera is looking at */
  look: [number, number, number];
};

/**
 * A slow inspection camera that rides a spline through the building.
 *
 * `progressRef` (0..1) is the scroll position along the whole journey.
 * `focusRef` holds a waypoint index when a trade has been selected, or -1;
 * a selection wins over scroll until the visitor scrolls again.
 * Movement is critically damped, so there is no snapping and no shake.
 */
export default function CinematicCamera({
  waypoints,
  progressRef,
  focusU,
  reduced,
  parallax = 0.6,
}: {
  waypoints: Waypoint[];
  progressRef: MutableRefObject<number>;
  /** target curve parameter coming from a service selection, or null */
  focusU: MutableRefObject<number | null>;
  reduced: boolean;
  parallax?: number;
}) {
  const { camera } = useThree();

  const posCurve = useMemo(
    () => new THREE.CatmullRomCurve3(waypoints.map((w) => new THREE.Vector3(...w.pos)), false, 'catmullrom', 0.2),
    [waypoints]
  );
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(waypoints.map((w) => new THREE.Vector3(...w.look)), false, 'catmullrom', 0.2),
    [waypoints]
  );

  const scratch = useMemo(
    () => ({
      wantPos: new THREE.Vector3(),
      wantLook: new THREE.Vector3(),
      curPos: new THREE.Vector3(...waypoints[0].pos),
      curLook: new THREE.Vector3(...waypoints[0].look),
      u: 0,
    }),
    [waypoints]
  );
  const started = useRef(false);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const targetU = THREE.MathUtils.clamp(focusU.current ?? progressRef.current, 0, 1);

    // ease along the curve parameter itself, so a service jump reads as a travel shot.
    // reduced motion skips the travel and cuts straight to the stop.
    scratch.u = reduced
      ? targetU
      : scratch.u + (targetU - scratch.u) * Math.min(1, d * (focusU.current === null ? 4.2 : 2.2));

    posCurve.getPoint(scratch.u, scratch.wantPos);
    lookCurve.getPoint(scratch.u, scratch.wantLook);

    if (!reduced) {
      // a breath of handheld parallax — never enough to read as shake
      scratch.wantPos.x += state.pointer.x * parallax;
      scratch.wantPos.y += state.pointer.y * parallax * 0.45;
    }

    if (!started.current) {
      scratch.curPos.copy(scratch.wantPos);
      scratch.curLook.copy(scratch.wantLook);
      started.current = true;
    }

    const k = reduced ? 1 : Math.min(1, d * 3.2);
    scratch.curPos.lerp(scratch.wantPos, k);
    scratch.curLook.lerp(scratch.wantLook, k);

    camera.position.copy(scratch.curPos);
    camera.lookAt(scratch.curLook);
  });

  return null;
}
