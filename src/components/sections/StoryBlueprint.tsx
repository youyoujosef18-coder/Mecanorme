'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Scroll-driven engineering story: a technical elevation of an industrial
 * building that surveys, equips, pipes, tests and commissions itself as
 * the visitor scrolls. Scrub-linked — scroll position IS the timeline.
 */

const C = {
  line: '#4A5578',
  steel: '#B9C0D4',
  orange: '#F57A1C',
  cyan: '#39B7D8',
  cold: '#4FC3F7',
  fire: '#E23D28',
  ok: '#2FBF71',
};

function band(p: MotionValue<number>, a: number, b: number) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useTransform(p, [a, b], [0, 1]);
}

function EquipPop({
  progress,
  index,
  x,
  y,
  w,
  h,
  label,
  color,
}: {
  progress: MotionValue<number>;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
}) {
  const opacity = useTransform(progress, [index * 0.22, index * 0.22 + 0.3], [0, 1]);
  const scale = useTransform(progress, [index * 0.22, index * 0.22 + 0.3], [0.85, 1]);
  return (
    <motion.g style={{ opacity, scale }}>
      <rect x={x} y={y} width={w} height={h} fill="rgba(12,22,56,0.6)" stroke={color} strokeWidth="2.5" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill={color} style={{ font: '700 11px "JetBrains Mono", monospace', letterSpacing: '0.14em' }}>
        {label}
      </text>
    </motion.g>
  );
}

function HeadPop({ progress, index, x }: { progress: MotionValue<number>; index: number; x: number }) {
  const opacity = useTransform(progress, [0.7 + index * 0.08, 0.85 + index * 0.08], [0, 1]);
  return (
    <motion.g style={{ opacity }}>
      <line x1={x} y1="215" x2={x} y2="232" stroke={C.fire} strokeWidth="2" />
      <path d={`M${x - 8},232 L${x + 8},232`} stroke={C.fire} strokeWidth="2.5" />
    </motion.g>
  );
}

export default function StoryBlueprint() {
  const { t } = useLang();
  const outer = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  scrollYProgress.on('change', (v) => {
    const s = Math.min(5, Math.floor(v * 6.2));
    setStage((prev) => (prev === s ? prev : s));
  });

  const p = scrollYProgress;

  // draw bands
  const building = band(p, 0.04, 0.2);
  const dims = band(p, 0.16, 0.3);
  const equipment = band(p, 0.3, 0.52);
  const nets = band(p, 0.5, 0.74);
  const tests = band(p, 0.72, 0.86);
  const online = band(p, 0.86, 0.96);

  const step = t.story.steps[stage];

  if (reduced) {
    // static, fully-built version + plain step list
    return (
      <section className="relative bg-navy-deep py-24" aria-label={t.story.title}>
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
          <span className="tech-label text-brand-orange">{t.story.kicker}</span>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase text-paper sm:text-5xl">{t.story.title}</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.story.steps.map((s, i) => (
              <li key={i} className="border border-navy-line/60 p-5">
                <span className="tech-label text-brand-orange">{s.tag}</span>
                <p className="mt-2 font-display text-lg font-bold uppercase text-paper">{s.t}</p>
                <p className="mt-1 text-sm text-steel-300">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={outer} className="relative h-[420vh] bg-navy-deep" aria-label={t.story.title}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="grid-bg-dark absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid h-full w-full max-w-[1500px] grid-rows-[auto_1fr] gap-4 px-5 py-20 sm:px-8 lg:grid-cols-[340px_1fr] lg:grid-rows-1 lg:items-center lg:py-24">
          {/* step text */}
          <div className="z-10 lg:pr-6">
            <span className="tech-label text-brand-orange">{t.story.kicker}</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase leading-tight text-paper sm:text-4xl">
              {t.story.title}
            </h2>
            <p className="mt-2 hidden text-sm text-steel-500 lg:block">{t.story.sub}</p>

            <div className="mt-6 border border-navy-line/60 bg-navy-night/70 p-5 backdrop-blur-sm lg:mt-10">
              <div className="flex items-center justify-between">
                <motion.span key={step.tag} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="tech-label text-brand-orange">
                  {step.tag}
                </motion.span>
                <span className="font-mono text-[11px] text-steel-500">
                  {String(stage + 1).padStart(2, '0')} / 06
                </span>
              </div>
              <motion.p key={step.t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-display text-2xl font-bold uppercase text-paper">
                {step.t}
              </motion.p>
              <motion.p key={step.d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 min-h-[3rem] text-sm leading-relaxed text-steel-300">
                {step.d}
              </motion.p>
              <div className="mt-4 flex gap-1.5">
                {t.story.steps.map((_, i) => (
                  <div key={i} className={`h-[3px] flex-1 transition-colors duration-300 ${i <= stage ? 'bg-brand-orange' : 'bg-navy-line/50'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* blueprint */}
          <div className="relative min-h-0">
            <svg viewBox="0 0 900 620" className="h-full max-h-[74vh] w-full" role="img" aria-label={t.story.title} preserveAspectRatio="xMidYMid meet">
              {/* ground */}
              <line x1="30" y1="560" x2="870" y2="560" stroke={C.line} strokeWidth="2" />
              {Array.from({ length: 22 }).map((_, i) => (
                <line key={i} x1={40 + i * 39} y1="560" x2={28 + i * 39} y2="576" stroke={C.line} strokeWidth="1" opacity="0.5" />
              ))}

              {/* building outline */}
              <motion.path
                d="M60,560 L60,180 L450,120 L840,180 L840,560"
                fill="none"
                stroke={C.steel}
                strokeWidth="3"
                style={{ pathLength: building }}
              />
              <motion.path d="M60,320 L840,320" fill="none" stroke={C.line} strokeWidth="1.5" style={{ pathLength: building }} />
              {[220, 450, 680].map((x) => (
                <motion.line key={x} x1={x} y1="560" x2={x} y2="325" stroke={C.line} strokeWidth="2" style={{ pathLength: building }} />
              ))}

              {/* dimensions / studies */}
              <motion.g style={{ opacity: dims }}>
                <path d="M60,595 L840,595 M60,588 L60,602 M840,588 L840,602" stroke={C.orange} strokeWidth="1.5" fill="none" />
                <text x="450" y="612" textAnchor="middle" fill={C.orange} style={{ font: '600 12px "JetBrains Mono", monospace', letterSpacing: '0.15em' }}>
                  84.00 m
                </text>
                <path d="M28,560 L28,180 M21,560 L35,560 M21,180 L35,180" stroke={C.orange} strokeWidth="1.5" fill="none" />
                <text x="14" y="380" fill={C.orange} transform="rotate(-90 14 380)" textAnchor="middle" style={{ font: '600 12px "JetBrains Mono", monospace', letterSpacing: '0.15em' }}>
                  12.40 m
                </text>
                <text x="66" y="150" fill={C.steel} style={{ font: '600 11px "JetBrains Mono", monospace', letterSpacing: '0.2em' }}>
                  MN-2026 / REV.B
                </text>
              </motion.g>

              {/* equipment pops */}
              {[
                { x: 95, y: 455, w: 130, h: 105, label: 'CTA', color: C.steel },
                { x: 305, y: 470, w: 90, h: 90, label: 'TR. EAU', color: C.cyan },
                { x: 545, y: 480, w: 110, h: 80, label: 'POMPES', color: C.orange },
                { x: 720, y: 445, w: 80, h: 115, label: 'BALLON', color: C.steel },
              ].map((e, i) => (
                <EquipPop key={e.label} progress={equipment} index={i} {...e} />
              ))}

              {/* networks */}
              <motion.path d="M225,470 L225,375 L700,375 L700,445" fill="none" stroke={C.orange} strokeWidth="3" style={{ pathLength: nets }} />
              <motion.path d="M160,455 L160,340 L820,340" fill="none" stroke={C.steel} strokeWidth="5" strokeOpacity="0.8" style={{ pathLength: nets }} />
              <motion.path d="M350,470 L350,300 L100,300" fill="none" stroke={C.cyan} strokeWidth="2.5" style={{ pathLength: nets }} />
              <motion.path d="M600,480 L600,215 L120,215" fill="none" stroke={C.fire} strokeWidth="2.5" style={{ pathLength: nets }} />
              {[200, 320, 440].map((x, i) => (
                <HeadPop key={x} progress={nets} index={i} x={x} />
              ))}

              {/* tests */}
              <motion.g style={{ opacity: tests }}>
                {[
                  { x: 225, y: 375 },
                  { x: 600, y: 300 },
                ].map((g) => (
                  <g key={`${g.x}`}>
                    <circle cx={g.x} cy={g.y} r="14" fill="rgba(8,15,38,0.9)" stroke={C.steel} strokeWidth="2" />
                    <line x1={g.x} y1={g.y} x2={g.x + 8} y2={g.y - 8} stroke={C.fire} strokeWidth="2" />
                  </g>
                ))}
                <g>
                  <rect x="655" y="170" width="150" height="34" fill="rgba(8,15,38,0.9)" stroke={C.orange} strokeWidth="1.5" />
                  <text x="730" y="191" textAnchor="middle" fill={C.orange} style={{ font: '700 11px "JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
                    ESSAI 6.9 BAR ✓
                  </text>
                </g>
              </motion.g>

              {/* commissioning flows */}
              <motion.g style={{ opacity: online }}>
                <style>{`@keyframes storyflow { to { stroke-dashoffset: -46; } }`}</style>
                <path d="M225,470 L225,375 L700,375 L700,445" fill="none" stroke={C.orange} strokeWidth="2" strokeDasharray="8 12" style={{ animation: 'storyflow 1.6s linear infinite' }} />
                <path d="M350,470 L350,300 L100,300" fill="none" stroke={C.cold} strokeWidth="2" strokeDasharray="8 12" style={{ animation: 'storyflow 2s linear infinite' }} />
                <rect x="368" y="80" width="164" height="36" fill="rgba(8,15,38,0.95)" stroke={C.ok} strokeWidth="1.5" />
                <circle cx="388" cy="98" r="4.5" fill={C.ok} />
                <text x="402" y="103" fill={C.ok} style={{ font: '700 11px "JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
                  {stage >= 5 ? 'SYSTEM ONLINE' : '· · ·'}
                </text>
              </motion.g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
