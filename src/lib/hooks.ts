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
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const v = Math.min(1, Math.max(0, -rect.top / range));
      progress.current = v;
      const q = Math.round(v * steps) / steps;
      setStepped((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, steps]);

  return { progress, stepped };
}
