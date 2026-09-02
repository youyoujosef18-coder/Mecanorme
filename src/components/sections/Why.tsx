'use client';

import React from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { Reveal } from '@/components/ui/primitives';
import Logo from '@/components/brand/Logo';

export default function Why() {
  const { t } = useLang();

  return (
    <section className="relative overflow-hidden bg-navy-deep py-24 lg:py-32">
      <div className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-[0.05] lg:block" aria-hidden>
        <Logo variant="mark" dark className="h-[560px] w-[560px]" />
      </div>
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="tri-marker" aria-hidden />
            <span className="tech-label text-brand-orange">06 / {t.why.kicker}</span>
          </div>
          <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-paper sm:text-5xl">
            {t.why.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-14 gap-y-0 lg:grid-cols-2">
          {t.why.items.map((item, i) => (
            <Reveal key={item.t} delay={i * 0.07}>
              <div className={`flex gap-6 border-t border-navy-line/50 py-8 ${i >= t.why.items.length - 2 ? 'lg:border-b' : ''}`}>
                <span className="font-mono text-sm font-bold text-brand-orange">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-paper">{item.t}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-steel-300">{item.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
