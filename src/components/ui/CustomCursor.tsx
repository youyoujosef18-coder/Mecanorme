'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { usePrefersReducedMotion } from '@/lib/hooks';

type CursorMode = 'default' | 'hover' | 'explore' | 'drive' | 'view';

const CursorCtx = createContext<{ setMode: (m: CursorMode) => void }>({ setMode: () => {} });

export function useCursor() {
  return useContext(CursorCtx);
}

/** Props helpers to attach to interactive elements */
export function useCursorHandlers(mode: CursorMode) {
  const { setMode } = useCursor();
  return {
    onMouseEnter: () => setMode(mode),
    onMouseLeave: () => setMode('default'),
  };
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CursorMode>('default');
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const reduced = usePrefersReducedMotion();
  const { t } = useLang();

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduced) {
      setEnabled(false);
      document.body.classList.remove('cursor-active');
      return;
    }
    setEnabled(true);
    document.body.classList.add('cursor-active');

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', move, { passive: true });

    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.16;
      ring.current.y += (pos.current.y - ring.current.y) * 0.16;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    // auto-detect plain interactive elements
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('a, button, [role="button"], input, textarea, select, label');
      setMode((m) => {
        if (m === 'explore' || m === 'drive' || m === 'view') return m;
        return el ? 'hover' : 'default';
      });
    };
    window.addEventListener('mouseover', over, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      cancelAnimationFrame(raf.current);
      document.body.classList.remove('cursor-active');
    };
  }, [reduced]);

  const setModeCb = useCallback((m: CursorMode) => setMode(m), []);

  const label =
    mode === 'explore' ? t.cursor.explore : mode === 'drive' ? t.cursor.drive : mode === 'view' ? t.cursor.view : '';
  const big = mode !== 'default';

  return (
    <CursorCtx.Provider value={{ setMode: setModeCb }}>
      {children}
      {enabled && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
          {/* trailing ring / label chip */}
          <div ref={ringRef} className="absolute left-0 top-0 will-change-transform">
            <div
              className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border transition-all duration-200 ${
                label
                  ? 'h-[54px] min-w-[54px] rounded-full border-brand-orange bg-navy-deep/85 px-2'
                  : big
                    ? 'h-10 w-10 rounded-full border-brand-orange/80 bg-transparent'
                    : 'h-7 w-7 rounded-full border-steel-500/60 bg-transparent'
              }`}
            >
              {label && (
                <span className="tech-label whitespace-nowrap text-[9px] text-brand-orange">{label}</span>
              )}
            </div>
          </div>
          {/* precision dot + crosshair */}
          <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div className={`h-1.5 w-1.5 rounded-full transition-colors ${big ? 'bg-brand-orange' : 'bg-paper'}`} />
            </div>
          </div>
        </div>
      )}
    </CursorCtx.Provider>
  );
}
