'use client';

import React, { type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { Reveal } from '@/components/ui/primitives';
import { useCursorHandlers } from '@/components/ui/CustomCursor';
import LazyScene from '@/components/three/LazyScene';
import ServiceDiagram from '@/components/fallbacks/ServiceDiagram';
import type { ServiceId } from '@/lib/i18n/dict';

const SceneShell = dynamic(() => import('@/components/three/SceneShell'), { ssr: false });

const WaterScene = dynamic(() => import('@/components/three/scenes/WaterScene'), { ssr: false });
const HVACScene = dynamic(() => import('@/components/three/scenes/HVACScene'), { ssr: false });
const FireScene = dynamic(() => import('@/components/three/scenes/FireScene'), { ssr: false });

type Shot = {
  id: ServiceId;
  Scene: ComponentType<{ mode: number; labels: string[] }>;
  mode: number;
  camera: [number, number, number];
  target: [number, number, number];
  fov: number;
};

/** Each case study runs its own live system rather than a still photograph. */
const SHOTS: Shot[] = [
  { id: 'water', Scene: WaterScene, mode: 3, camera: [4.7, 2.1, 5.7], target: [0.25, -0.35, 0], fov: 34 },
  { id: 'hvac', Scene: HVACScene, mode: 1, camera: [4.0, 2.0, 4.6], target: [0.1, -0.2, 0], fov: 34 },
  { id: 'fire', Scene: FireScene, mode: 2, camera: [3.4, 1.4, 4.6], target: [0.6, -0.2, 0], fov: 36 },
];

export default function Projects() {
  const { t } = useLang();
  const view = useCursorHandlers('view');

  return (
    <section id="interventions" className="relative bg-navy-night py-24 lg:py-32">
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="tri-marker" aria-hidden />
                <span className="tech-label text-brand-orange">05 / {t.projects.kicker}</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-paper sm:text-5xl">
                {t.projects.title}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-steel-500">{t.projects.note}</p>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-20">
          {t.projects.items.map((p, i) => {
            const shot = SHOTS[i];
            return (
              <Reveal key={p.t}>
                <article
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* live system visual */}
                  <div
                    className="chamfer relative aspect-[16/10] overflow-hidden border border-navy-line/60 bg-navy-deep"
                    {...view}
                  >
                    <div className="grid-bg-dark absolute inset-0" aria-hidden />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(70% 60% at 50% 45%, rgba(36,53,110,0.5) 0%, rgba(12,22,56,0.3) 55%, rgba(8,15,38,0.85) 100%)',
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-0">
                      <LazyScene fallback={<ServiceDiagram id={shot.id} />} rootMargin="80px 0px 80px 0px">
                        <SceneShell
                          camera={shot.camera}
                          target={shot.target}
                          fov={shot.fov}
                          orbit
                          autoRotate
                          zoom={false}
                          floor={null}
                          minPolar={Math.PI / 3.4}
                          maxPolar={Math.PI / 2.1}
                        >
                          <shot.Scene mode={shot.mode} labels={[]} />
                        </SceneShell>
                      </LazyScene>
                    </div>
                    <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="led led-ok" aria-hidden />
                      <span className="tech-label text-steel-300">{p.sector}</span>
                    </div>
                    <span className="tech-label pointer-events-none absolute right-4 top-4 border border-navy-line/70 bg-navy-night/70 px-2.5 py-1 text-steel-500">
                      N° {String(i + 1).padStart(3, '0')}
                    </span>
                  </div>

                  {/* copy */}
                  <div>
                    <span className="font-mono text-5xl font-bold text-navy-soft">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-4 max-w-lg font-display text-2xl font-bold uppercase leading-tight tracking-wide text-paper sm:text-3xl">
                      {p.t}
                    </h3>
                    <div className="brand-rule mt-5 max-w-[180px] text-navy-line" aria-hidden />
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-steel-300">{p.scope}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="tech-label border border-navy-line/70 px-3 py-1.5 text-steel-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 flex justify-center">
            <a
              href="#contact"
              className="chamfer-sm inline-flex items-center gap-3 border border-steel-500/50 px-7 py-4 text-sm font-semibold tracking-wide text-paper transition-colors hover:border-brand-orange hover:text-brand-orange"
            >
              <span className="tri-marker-right" aria-hidden />
              {t.projects.cta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
