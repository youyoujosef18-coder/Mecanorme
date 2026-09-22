'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { MagneticButton } from '@/components/ui/primitives';
import ServiceDiagram from '@/components/fallbacks/ServiceDiagram';
import { useCursorHandlers } from '@/components/ui/CustomCursor';
import {
  useIsMobile,
  useIsPortrait,
  usePrefersReducedMotion,
  useSectionProgress,
  useWebGLSupport,
} from '@/lib/hooks';
import HeroStage from '@/components/sections/HeroStage';
import type { Waypoint } from '@/components/three/CinematicCamera';
import { SERVICE_IDS, type ServiceId } from '@/lib/i18n/dict';

/**
 * The journey, in the order the camera flies it. Index 0 is the exterior
 * establishing shot and the last stop is the full cutaway reveal; the six
 * trades sit in between, so the service selector can travel straight to one.
 */
const WAYPOINTS: Waypoint[] = [
  { pos: [26, 11.5, 29], look: [0, 4.2, 0] }, // 0 · exterior
  { pos: [17, 7.6, 19], look: [-0.5, 4.0, -1] }, // 1 · approach, the shell opens
  { pos: [-6.8, 3.2, 5.6], look: [-9.0, 1.6, -4.0] }, // 2 · RDC — traitement des eaux
  { pos: [18.5, 3.3, 2.2], look: [8.8, 1.6, -3.0] }, // 3 · RDC — protection incendie
  { pos: [5.6, 2.6, 12.6], look: [9.8, 2.2, 3.6] }, // 4 · RDC — plomberie
  { pos: [7.5, 5.2, 16.0], look: [1.0, 4.1, 0.0] }, // 5 · the vertical link
  { pos: [2.0, 6.6, 4.8], look: [-7.8, 5.7, -3.4] }, // 6 · R+1 — CVC
  { pos: [7.6, 6.1, 5.2], look: [2.6, 5.7, -1.6] }, // 7 · R+1 — tuyauterie
  { pos: [-0.2, 6.3, 6.6], look: [2.8, 6.75, 0.6] }, // 8 · R+1 — calorifugeage
  { pos: [22, 11, 26], look: [0, 4.2, 0] }, // 9 · full system reveal
];

const TRADE_STOP: Record<ServiceId, number> = {
  water: 2,
  fire: 3,
  plumbing: 4,
  hvac: 6,
  piping: 7,
  insulation: 8,
};
/** code the scene uses to emphasise one trade (calorifugeage opens its cladding) */
const TRADE_CODE: Record<ServiceId, number> = {
  piping: 0,
  hvac: 1,
  water: 2,
  fire: 3,
  insulation: 4,
  plumbing: 5,
};

/** which level each stop is on: 0 = ground, 1 = plant floor, 2 = both / whole building */
const STOP_LEVEL = [2, 2, 0, 0, 0, 2, 1, 1, 1, 2];

const U = (i: number) => i / (WAYPOINTS.length - 1);

const CLAMP2: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export default function Hero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const focusU = useRef<number | null>(null);
  const focusRef = useRef(-1);
  const drive = useCursorHandlers('drive');
  const explore = useCursorHandlers('explore');
  const mobile = useIsMobile(1024);
  const portrait = useIsPortrait();
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();

  const { progress, stepped } = useSectionProgress(ref);
  const [selected, setSelected] = useState<ServiceId | null>(null);
  const [manualStage, setManualStage] = useState<number | null>(null);

  // scrolling always takes the wheel back from a service selection
  const lastScroll = useRef(stepped);
  useEffect(() => {
    if (stepped !== lastScroll.current) {
      lastScroll.current = stepped;
      if (focusU.current !== null) {
        focusU.current = null;
        focusRef.current = -1;
        setSelected(null);
        setManualStage(null);
      }
    }
  }, [stepped]);

  const scrollStage = Math.min(WAYPOINTS.length - 1, Math.round(stepped * (WAYPOINTS.length - 1)));
  const stage = manualStage ?? scrollStage;
  // picking a trade is a request to look at the building, so the headline steps aside
  const overlay = selected ? 0 : Math.max(0, Math.min(1, 1 - (stepped - 0.06) / 0.08));

  const detail = t.hero.detail[stage] ?? t.hero.detail[0];
  const levelPills = ([0, 1] as const).map((lv) => {
    const on = STOP_LEVEL[stage] === lv || STOP_LEVEL[stage] === 2;
    return (
      <span
        key={lv}
        className={`chamfer-sm border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider2 ${
          on ? 'border-brand-orange/70 bg-brand-orange/15 text-brand-orange' : 'border-navy-line/60 text-steel-700'
        }`}
      >
        {lv === 0 ? t.hero.levels.ground : t.hero.levels.plant}
      </span>
    );
  });

  const pick = useCallback((id: ServiceId) => {
    const stop = TRADE_STOP[id];
    focusU.current = U(stop);
    focusRef.current = TRADE_CODE[id];
    setSelected(id);
    setManualStage(stop);
  }, []);

  /**
   * Portrait is far narrower than it is tall, so the desktop framing would crop
   * the building. The wide shots swing round to look along the long axis, and
   * the interior stops simply stand further back from the same subject.
   */
  const waypoints = useMemo(() => {
    if (!mobile) return WAYPOINTS;
    // a phone on its side is wide, not narrow: it gets the desktop framing, a touch further back
    if (!portrait)
      return WAYPOINTS.map((w) => ({
        look: w.look,
        pos: [
          w.look[0] + (w.pos[0] - w.look[0]) * 1.12,
          w.look[1] + (w.pos[1] - w.look[1]) * 1.12,
          w.look[2] + (w.pos[2] - w.look[2]) * 1.12,
        ] as [number, number, number],
      }));
    // step back in plan only — lifting the eye as well would put the camera
    // above the slab and turn every interior stop into a view of a ceiling.
    const pullBack = (w: Waypoint, k: number): Waypoint => ({
      look: [w.look[0], w.look[1] + 0.45, w.look[2]],
      pos: [
        w.look[0] + (w.pos[0] - w.look[0]) * k,
        w.pos[1] + (w.pos[1] - w.look[1]) * (k - 1) * 0.25,
        w.look[2] + (w.pos[2] - w.look[2]) * k,
      ],
    });
    const WIDE: Record<number, Waypoint> = {
      0: { pos: [49, 18, 32], look: [0, 4.2, 0] },
      1: { pos: [33, 13, 22], look: [-1, 4.1, -1] },
      5: { pos: [11, 5.4, 24], look: [1.0, 4.2, 0] },
      9: { pos: [47, 17.5, 31], look: [0, 4.2, 0] },
    };
    return WAYPOINTS.map((w, i) => WIDE[i] ?? pullBack(w, 1.55));
  }, [mobile, portrait]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative bg-navy-night"
      style={{ height: reduced ? '240vh' : mobile ? '300vh' : '380vh' }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="grid-bg-dark absolute inset-0" aria-hidden />

        {/* ---------------- the building ---------------- */}
        <div className="absolute inset-0" {...drive}>
          {webgl === false ? (
            <ServiceDiagram id="piping" />
          ) : (
            webgl && (
              <HeroStage
                waypoints={waypoints}
                progressRef={progress}
                focusU={focusU}
                focusRef={focusRef}
                mobile={mobile}
                portrait={portrait}
                reduced={reduced}
              />
            )
          )}
        </div>

        {/* atmosphere + legibility for the overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(8,15,38,0.95) 0%, rgba(8,15,38,0.74) 24%, rgba(8,15,38,0.10) 50%, rgba(8,15,38,0.5) 100%)',
            opacity: 0.45 + overlay * 0.55,
          }}
          aria-hidden
        />

        {/* ---------------- headline overlay ---------------- */}
        <div
          className="safe-x pointer-events-none relative z-10 mx-auto flex w-full min-h-0 max-w-[1500px] flex-1 flex-col justify-center overflow-hidden pt-28 [@media(max-height:560px)]:pt-14"
          style={{
            opacity: overlay,
            transform: `translateY(${(1 - overlay) * -50}px)`,
            transition: 'opacity 120ms linear',
            visibility: overlay < 0.02 ? 'hidden' : 'visible',
          }}
        >
          <div className="pointer-events-auto max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="led led-ok led-pulse text-ok" aria-hidden />
              <span className="tech-label text-steel-300">{t.hero.kicker}</span>
            </div>
            <h1 className="font-display text-[10vw] font-black uppercase leading-[0.94] tracking-tight text-paper [@media(max-height:560px)]:text-3xl sm:text-5xl lg:text-[3.9rem]">
              {t.hero.line1} {t.hero.line1b}
              <br />
              <span>{t.hero.line2} </span>
              <span className="text-brand-orange">{t.hero.line2b}</span>
            </h1>
            <div className="brand-rule mt-6 max-w-xs text-navy-line [@media(max-height:560px)]:hidden" aria-hidden />
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-steel-300 [@media(max-height:560px)]:hidden sm:text-base">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 [@media(max-height:560px)]:mt-4">
              <MagneticButton href="#contact">{t.hero.cta1}</MagneticButton>
              <MagneticButton href="#demonstration" variant="ghost">
                {t.hero.cta2}
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* ---------------- stage readout + service selector ---------------- */}
        <div className="safe-x relative z-10 mx-auto w-full shrink-0 max-w-[1500px] pb-3 lg:pb-5">
          {/* compact readout where there is no room for the full panel */}
          <div className="chamfer-sm mb-3 max-w-[38rem] border border-navy-line/50 bg-navy-night/55 px-3 py-2 backdrop-blur-[2px] [@media(max-height:560px)]:mb-1.5 [@media(max-height:560px)]:py-1.5 lg:hidden">
            <div className="mb-1.5 flex items-center gap-2">
              {levelPills}
            </div>
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-wide text-paper">
              <span className="mr-2 font-mono text-xs text-brand-orange">{String(stage).padStart(2, '0')}</span>
              {t.hero.stages[stage]}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-steel-400 [@media(max-height:560px)]:hidden" style={CLAMP2}>
              {detail.d}
            </p>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="hidden shrink-0 lg:block">
              <span className="tech-label text-steel-500">{t.hero.stageLabel}</span>
              <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-paper">
                <span className="mr-2 font-mono text-sm text-brand-orange">{String(stage).padStart(2, '0')}</span>
                {t.hero.stages[stage]}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="tech-label mr-1 text-steel-700">{t.hero.levelLabel}</span>
                {levelPills}
              </div>
              <div className="brand-rule mt-3 max-w-[16rem] text-navy-line" aria-hidden />
              <p className="mt-3 max-w-[24rem] text-[13px] leading-relaxed text-steel-300">{detail.d}</p>
              <ul className="mt-3 grid max-w-[26rem] grid-cols-2 gap-x-5 gap-y-1.5">
                {detail.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[11px] uppercase tracking-wider2 text-steel-500">
                    <span className="mt-[5px] h-1 w-1 shrink-0 bg-brand-orange" aria-hidden />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <nav
              aria-label={t.hero.selectLabel}
              className="scrollbar-none -mx-5 flex w-full gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:w-auto lg:justify-end lg:overflow-visible lg:px-0"
            >
              {SERVICE_IDS.map((id, i) => {
                const active = selected === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    aria-pressed={active}
                    {...explore}
                    className={`chamfer-sm flex min-h-[44px] shrink-0 items-center gap-2 border px-3.5 py-2.5 text-left transition-all duration-300 active:scale-[0.97] ${
                      active
                        ? 'border-brand-orange bg-brand-orange/15 text-paper'
                        : 'border-navy-line/70 bg-navy-night/55 text-steel-300 backdrop-blur-sm hover:border-steel-500 hover:text-paper'
                    }`}
                  >
                    <span className={`font-mono text-[10px] font-bold ${active ? 'text-brand-orange' : 'text-steel-700'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider2">
                      {t.services[id].nameShort}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ---------------- status strip ---------------- */}
        <div className="safe-inset-b relative z-10 shrink-0 border-t border-navy-line/50 bg-navy-night/60 backdrop-blur-sm">
          <div className="safe-x mx-auto flex max-w-[1500px] flex-nowrap items-center justify-between gap-4 py-3.5 [@media(max-height:560px)]:py-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="led led-ok" aria-hidden />
              <span className="tech-label truncate text-steel-300">{t.hero.statusOnline}</span>
            </span>

            <div className="hidden flex-1 items-center gap-3 px-6 md:flex">
              <span className="tech-label text-steel-700">{t.misc.scrollProgress}</span>
              <div className="relative h-[2px] flex-1 bg-navy-line/50">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-orange transition-[width] duration-150"
                  style={{ width: `${Math.round((manualStage !== null ? U(manualStage) : stepped) * 100)}%` }}
                />
              </div>
            </div>

            <span className="tech-label text-steel-500">{reduced ? t.hero.statusReady : t.hero.scroll}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
