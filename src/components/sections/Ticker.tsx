'use client';

import React from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { usePrefersReducedMotion } from '@/lib/hooks';

export default function Ticker() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const items = [...t.ticker, ...t.ticker];

  return (
    <div className="relative overflow-hidden border-y border-navy-line/60 bg-navy-deep py-4" aria-hidden>
      <div className={`flex w-max items-center gap-10 whitespace-nowrap ${reduced ? '' : 'animate-marquee'}`}>
        {items.map((s, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-sm font-bold uppercase tracking-wide3 text-steel-500">{s}</span>
            <span className="tri-marker" />
          </span>
        ))}
      </div>
    </div>
  );
}
