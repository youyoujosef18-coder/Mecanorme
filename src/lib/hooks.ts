'use client';

import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setMobile(mq.matches);
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [breakpoint]);
  return mobile;
}

export function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setCoarse(mq.matches);
    const fn = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return coarse;
}

export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/** Simulated live metric value (demo only — labeled in the UI). */
export function useSimulatedMetric(base: number, jitter: number, decimals: number, active = true) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setValue(() => {
        const next = base + (Math.random() * 2 - 1) * jitter;
        return Number(next.toFixed(decimals));
      });
    }, 1400 + Math.random() * 600);
    return () => window.clearInterval(id);
  }, [base, jitter, decimals, active]);
  return active ? value : 0;
}

/**
 * Progress (0..1) of a tall section as it scrolls past a sticky viewport.
 * Measured directly from the element rect so it works in any embedding —
 * `ref.progress` is a live ref for animation frames, `stepped` is a quantised
 * value safe to render with.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement>, steps = 60) {
  const progress = useRef(0);
  const [stepped, setStepped] = useState(0);

  useEffect(() => {
    let raf = 0;
    // Mobile browsers resize the viewport as the address bar shows / hides.
    // Measure against the largest height seen for the current width so the
    // story does not jump when Chrome's toolbar collapses.
    let refWidth = window.innerWidth;
    let refHeight = window.innerHeight;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = Math.max(1, el.offsetHeight - refHeight);
      const v = Math.min(1, Math.max(0, -rect.top / range));
      progress.current = v;
      const q = Math.round(v * steps) / steps;
      setStepped((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => {
      if (window.innerHeight > refHeight) refHeight = window.innerHeight;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const onResize = () => {
      if (window.innerWidth !== refWidth) {
        refWidth = window.innerWidth;
        refHeight = window.innerHeight;
      } else if (window.innerHeight > refHeight) {
        refHeight = window.innerHeight;
      }
      onScroll();
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      cancelAnimationFrame(raf);
    };
  }, [ref, steps]);

  return { progress, stepped };
}

/** Frames follow the screen's shape, not its width: a phone held sideways is not "mobile portrait". */
export function useIsPortrait() {
  const [portrait, setPortrait] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    setPortrait(mq.matches);
    const fn = (e: MediaQueryListEvent) => setPortrait(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return portrait;
}

export type DeviceTier = { tier: 'high' | 'mid' | 'weak'; maxDpr: number };

/**
 * Rough performance tier from cores, memory and data-saver, so an entry-level
 * phone does not render the scene a flagship gets.
 */
export function useDeviceTier() {
  const [tier, setTier] = useState<DeviceTier>({ tier: 'high', maxDpr: 1.5 });
  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    const saveData = nav.connection?.saveData === true;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (saveData || cores <= 4 || memory <= 4) setTier({ tier: 'weak', maxDpr: 1 });
    else setTier(coarse ? { tier: 'mid', maxDpr: 1.5 } : { tier: 'high', maxDpr: 1.8 });
  }, []);
  return tier;
}

/**
 * Android drops WebGL contexts of backgrounded tabs. Prevent the default so the
 * browser may restore it; if it does not come back, bump `key` to remount the canvas.
 */
export function useContextLossRecovery() {
  const [key, setKey] = useState(0);
  const timer = useRef(0);
  const attach = (canvas: HTMLCanvasElement) => {
    const onLost = (e: Event) => {
      e.preventDefault();
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setKey((k) => k + 1), 2500);
    };
    const onRestored = () => window.clearTimeout(timer.current);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { key, attach };
}

/** Lock page scroll behind an overlay (mobile menu). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}
