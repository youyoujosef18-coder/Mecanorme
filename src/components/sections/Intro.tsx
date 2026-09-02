'use client';

import React from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { Reveal } from '@/components/ui/primitives';
import Logo from '@/components/brand/Logo';

export default function Intro() {
  const { t } = useLang();

  return (
    <section id="qui-sommes-nous" className="relative bg-paper py-24 text-navy lg:py-32">
      <div className="grid-bg-light absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="tri-marker" aria-hidden />
                <span className="tech-label text-brand-ember">01 / {t.intro.kicker}</span>
              </div>
              <h2 className="mt-5 whitespace-pre-line font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
                {t.intro.title}
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="brand-rule mt-8 max-w-sm text-navy" aria-hidden />
              <div className="mt-10 hidden lg:block">
                <Logo variant="mark" className="h-40 w-40 opacity-[0.08]" />
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-steel-700">{t.intro.p1}</p>
              <p className="mt-5 text-lg leading-relaxed text-steel-700">{t.intro.p2}</p>
            </Reveal>

            <div className="mt-10 flex flex-col divide-y divide-navy/10 border-y border-navy/10">
              {t.intro.points.map((pt, i) => (
                <Reveal key={pt.t} delay={0.12 + i * 0.08}>
                  <div className="flex items-start gap-5 py-5">
                    <span className="slits mt-1 h-8 w-5 shrink-0 text-brand-orange" aria-hidden />
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide">{pt.t}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-steel-700">{pt.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="tech-label border border-navy/15 px-4 py-2.5 text-navy">{t.intro.based}</span>
                <span className="tech-label border border-navy/15 bg-navy px-4 py-2.5 text-paper">{t.intro.coverage}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
