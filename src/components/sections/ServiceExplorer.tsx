'use client';

import React, { useMemo, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { SERVICES, SERVICE_BY_ID } from '@/lib/data/services';
import type { Lang, ServiceId } from '@/lib/i18n/dict';
import { SectionHeader } from '@/components/ui/primitives';
import LazyScene from '@/components/three/LazyScene';
import ServiceDiagram from '@/components/fallbacks/ServiceDiagram';
import { useSimulatedMetric, useIsCoarsePointer } from '@/lib/hooks';
import { useCursorHandlers } from '@/components/ui/CustomCursor';

const SceneShell = dynamic(() => import('@/components/three/SceneShell'), { ssr: false });

const SceneComponents: Record<ServiceId, ComponentType<{ mode: number; labels: string[] }>> = {
  piping: dynamic(() => import('@/components/three/scenes/PipingScene'), { ssr: false }),
  hvac: dynamic(() => import('@/components/three/scenes/HVACScene'), { ssr: false }),
  water: dynamic(() => import('@/components/three/scenes/WaterScene'), { ssr: false }),
  fire: dynamic(() => import('@/components/three/scenes/FireScene'), { ssr: false }),
  insulation: dynamic(() => import('@/components/three/scenes/InsulationScene'), { ssr: false }),
  plumbing: dynamic(() => import('@/components/three/scenes/PlumbingScene'), { ssr: false }),
};

const SCENE_LABELS: Record<Lang, Record<ServiceId, string[]>> = {
  fr: {
    piping: ["Vanne d'isolement DN100", 'Pompe centrifuge', 'Ligne process — acier', 'Réservoir tampon', 'FERMÉE', 'OUVERTE'],
    hvac: ['CTA — soufflage', 'Gaine principale', 'Diffuseur plafonnier', "Reprise d'air"],
    water: ['Eau brute', 'Filtres multimédia', 'Membranes osmose inverse', 'Eau traitée'],
    fire: ['Réserve incendie', 'Groupe motopompe', 'Têtes sprinkler', 'Collecteur sous pression'],
    insulation: ['Tube nu — pertes thermiques', 'Calorifugé — tôle alu', 'Laine de roche 80 mm', 'Cerclage inox', '165 °C', '38 °C'],
    plumbing: ['Colonne eau froide', 'Production ECS', 'Chute EU', 'Surpresseur'],
  },
  en: {
    piping: ['Isolation valve DN100', 'Centrifugal pump', 'Process line — steel', 'Buffer vessel', 'CLOSED', 'OPEN'],
    hvac: ['AHU — supply', 'Main duct', 'Ceiling diffuser', 'Return air'],
    water: ['Raw water', 'Multimedia filters', 'RO membranes', 'Treated water'],
    fire: ['Fire water reserve', 'Fire pump set', 'Sprinkler heads', 'Pressurized main'],
    insulation: ['Bare pipe — heat losses', 'Insulated — alu cladding', 'Rock wool 80 mm', 'Stainless strapping', '165 °C', '38 °C'],
    plumbing: ['Cold water riser', 'DHW production', 'Waste stack', 'Booster set'],
  },
};

function MetricRow({
  label,
  unit,
  base,
  jitter,
  decimals,
  accent,
  boost,
}: {
  label: string;
  unit: string;
  base: number;
  jitter: number;
  decimals: number;
  accent: string;
  boost: number;
}) {
  // percentages never exceed 100 — only rate/pressure metrics respond to the boost
  const isPct = unit === '%';
  const raw = useSimulatedMetric(isPct ? base : base * boost, jitter, decimals, true);
  const value = isPct ? Math.min(100, raw) : raw;
  const pct = isPct
    ? value
    : Math.min(100, Math.max(14, 50 + ((value - base) / Math.max(base, 0.001)) * 260 + (boost - 1) * 260));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="tech-label text-steel-500">{label}</span>
        <span className="font-mono text-lg font-bold text-paper">
          {value.toFixed(decimals)}
          <span className="ml-1 text-[11px] font-normal text-steel-500">{unit}</span>
        </span>
      </div>
      <div className="mt-1.5 h-[3px] w-full bg-navy-line/40">
        <div className="h-full transition-[width] duration-700" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}

export default function ServiceExplorer() {
  const { t, lang } = useLang();
  const [activeId, setActiveId] = useState<ServiceId>('piping');
  const [mode, setMode] = useState(0);
  const [wipe, setWipe] = useState(false);
  const coarse = useIsCoarsePointer();
  const explore = useCursorHandlers('explore');
  const drive = useCursorHandlers('drive');

  const def = SERVICE_BY_ID[activeId];
  const copy = t.services[activeId];
  const labels = SCENE_LABELS[lang][activeId];
  const Scene = SceneComponents[activeId];

  const select = (id: ServiceId) => {
    if (id === activeId) return;
    setWipe(true);
    window.setTimeout(() => {
      setActiveId(id);
      setMode(0);
    }, 220);
    window.setTimeout(() => setWipe(false), 560);
  };

  const statusLabel =
    activeId === 'fire' && mode === 0 ? t.explorer.standby : mode === 0 ? t.explorer.operational : t.explorer.active;
  const statusTone = activeId === 'fire' && mode === 0 ? 'led-warn text-warn' : 'led-ok text-ok';
  const boost = mode >= 1 ? 1.06 : 1;

  const fallback = useMemo(() => <ServiceDiagram id={activeId} title={t.explorer.fallback} />, [activeId, t.explorer.fallback]);

  return (
    <section id="demonstration" className="relative bg-navy-night py-24 lg:py-32">
      <div className="dot-bg-dark absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <SectionHeader kicker={t.explorer.kicker} title={t.explorer.title} sub={t.explorer.sub} index="02" />

        <div id="metiers" className="mt-14 grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_330px]">
          {/* ---- service selector rail ---- */}
          <nav
            className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
            aria-label={t.explorer.kicker}
          >
            {SERVICES.map((s) => {
              const active = s.id === activeId;
              const c = t.services[s.id];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => select(s.id)}
                  aria-pressed={active}
                  {...explore}
                  className={`group relative flex shrink-0 items-center gap-3 border px-4 py-3.5 text-left transition-all duration-300 lg:border-x-0 lg:border-b lg:border-t-0 lg:px-2 lg:py-5 ${
                    active
                      ? 'border-brand-orange bg-brand-orange/5 lg:border-navy-line/50 lg:bg-transparent'
                      : 'border-navy-line/50 hover:bg-navy-deep/60'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0 hidden h-full w-[3px] transition-all duration-300 lg:block ${
                      active ? 'bg-brand-orange' : 'bg-transparent group-hover:bg-navy-line'
                    }`}
                    aria-hidden
                  />
                  <span className={`font-mono text-xs font-bold ${active ? 'text-brand-orange' : 'text-steel-700'}`}>{s.index}</span>
                  <span
                    className={`font-display text-sm font-bold uppercase tracking-wide transition-colors lg:text-base ${
                      active ? 'text-paper' : 'text-steel-500 group-hover:text-steel-300'
                    }`}
                  >
                    {c.nameShort}
                  </span>
                  {active && <span className="tri-marker-right ml-auto hidden lg:block" aria-hidden />}
                </button>
              );
            })}
          </nav>

          {/* ---- 3D stage ---- */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-paper sm:text-2xl">
                <span className="mr-3 font-mono text-sm text-brand-orange">{def.index}</span>
                {copy.name}
              </h3>
              <span className="tech-label hidden text-steel-500 md:block">{coarse ? t.explorer.tapInteract : t.explorer.interact}</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-300">{copy.desc}</p>

            <div
              className="chamfer relative mt-5 h-[380px] overflow-hidden border border-navy-line/60 bg-navy-deep/60 sm:h-[460px] lg:h-[520px]"
              {...drive}
            >
              <LazyScene fallback={fallback}>
                <SceneShell
                  camera={coarse ? [6.9, 4.0, 8.1] : [5.4, 3.2, 6.4]}
                  target={[0, -0.1, 0]}
                  fov={36}
                  zoom={false}
                  floor={-1.95}
                >
                  <Scene mode={mode} labels={labels} />
                </SceneShell>
              </LazyScene>

              {/* corner state chip */}
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 border border-navy-line/70 bg-navy-night/80 px-3 py-1.5 backdrop-blur-sm">
                <span className={`led ${statusTone.split(' ')[0]}`} aria-hidden />
                <span className="tech-label text-steel-300">{statusLabel}</span>
              </div>

              {/* switch wipe */}
              <AnimatePresence>
                {wipe && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 z-10 bg-navy-night"
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    exit={{ clipPath: 'inset(0 0 0 100%)' }}
                    transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <div className="absolute inset-y-0 right-0 w-1 bg-brand-orange" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---- interactive controls ---- */}
            <div className="mt-4">
              <span className="tech-label text-steel-500">{t.explorer.controlsTitle}</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t.explorer.controlsTitle}>
                {copy.controls.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMode(i)}
                    aria-pressed={mode === i}
                    className={`chamfer-sm border px-3 py-3 font-mono text-[11px] font-bold tracking-wider2 transition-all duration-200 ${
                      mode === i
                        ? 'border-brand-orange bg-brand-orange text-white'
                        : 'border-navy-line/60 bg-navy-deep/40 text-steel-300 hover:border-steel-500 hover:text-paper'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---- status + scope panel ---- */}
          <aside className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <div className="scanline chamfer relative overflow-hidden border border-navy-line/60 bg-navy-deep/70 p-5">
              <div className="flex items-center justify-between">
                <span className="tech-label text-steel-300">{t.explorer.statusTitle}</span>
                <span className="flex items-center gap-2">
                  <span className={`led ${statusTone.split(' ')[0]} led-pulse ${statusTone.split(' ')[1]}`} aria-hidden />
                  <span className="font-mono text-[10px] font-bold tracking-wider2 text-paper">{statusLabel}</span>
                </span>
              </div>
              <div className="dim-line mt-4 text-navy-line" aria-hidden />
              <div className="mt-5 flex flex-col gap-5">
                {copy.metrics.map((m, i) => (
                  <MetricRow
                    key={`${activeId}-${i}`}
                    label={m.label}
                    unit={m.unit}
                    base={def.sims[i].base}
                    jitter={def.sims[i].jitter}
                    decimals={def.sims[i].decimals}
                    accent={def.accent}
                    boost={boost}
                  />
                ))}
              </div>
              <p className="mt-5 text-[10px] leading-relaxed text-steel-700">{t.explorer.simNote}</p>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <span className="tech-label text-steel-500">{t.explorer.capabilitiesTitle}</span>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {copy.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-3 text-sm leading-snug text-steel-300">
                      <span className="tri-marker mt-1 shrink-0" aria-hidden />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="tech-label text-steel-500">{t.explorer.applicationsTitle}</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {copy.applications.map((a) => (
                    <span key={a} className="border border-navy-line/70 px-3 py-1.5 text-xs text-steel-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="#contact"
                className="chamfer-sm mt-auto inline-flex items-center justify-center gap-2 border border-brand-orange px-5 py-3.5 text-xs font-bold uppercase tracking-wider2 text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
              >
                {t.explorer.cta}
                <span className="tri-marker-right" aria-hidden />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
