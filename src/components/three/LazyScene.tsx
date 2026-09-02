'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebGLSupport } from '@/lib/hooks';

/** Error boundary — a failed scene must never break the page. */
class SceneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — fallback rendered */
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Mounts its 3D children only when near the viewport; renders the 2D
 * technical-diagram fallback when WebGL is unavailable or the scene crashes.
 */
export default function LazyScene({
  children,
  fallback,
  className = '',
  keepMounted = false,
  rootMargin = '520px 0px 520px 0px',
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
  /** how early the scene mounts; tighter values keep fewer WebGL contexts alive at once */
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const webgl = useWebGLSupport();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        else if (!keepMounted) setNear(false);
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [keepMounted, rootMargin]);

  /**
   * A canvas mounted while it is still off-screen can miss its first
   * measurement and sit at the 300x150 default until something resizes the
   * window. Nudging the measurement just after mount avoids a scene that
   * renders into a postage stamp.
   */
  useEffect(() => {
    if (!near) return;
    const fire = () => window.dispatchEvent(new Event('resize'));
    const raf = requestAnimationFrame(fire);
    const t1 = window.setTimeout(fire, 120);
    const t2 = window.setTimeout(fire, 500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [near]);

  return (
    <div ref={ref} className={`relative h-full w-full ${className}`}>
      {webgl === false ? (
        <div className="h-full w-full">{fallback}</div>
      ) : near && webgl ? (
        <SceneErrorBoundary fallback={<div className="h-full w-full">{fallback}</div>}>
          {children}
        </SceneErrorBoundary>
      ) : (
        <div className="h-full w-full" aria-hidden />
      )}
    </div>
  );
}
