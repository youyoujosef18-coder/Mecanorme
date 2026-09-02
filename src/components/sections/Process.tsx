'use client';

import React from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { Reveal } from '@/components/ui/primitives';

export default function Process() {
  const { t } = useLang();

  return (
    <section id="methode" className="relative bg-paper py-24 text-navy lg:py-32">
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="tri-marker" aria-hidden />
            <span className="tech-label text-brand-ember">04 / {t.process.kicker}</span>
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            {t.process.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="group bg-paper">
              <div className="relative flex h-full flex-col p-7 transition-colors duration-300 hover:bg-navy hover:text-paper lg:p-8">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm font-bold text-brand-ember group-hover:text-brand-orange">{s.n}</span>
                  <span className="slits h-6 w-8 text-navy/20 group-hover:text-brand-orange/60" aria-hidden />
                </div>
                <h3 className="mt-14 font-display text-xl font-bold uppercase leading-tight tracking-wide">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel-700 group-hover:text-steel-300">{s.d}</p>
                {i < t.process.steps.length - 1 && (
                  <span className="tri-marker-right absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 lg:block" aria-hidden />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
