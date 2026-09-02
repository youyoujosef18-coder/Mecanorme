'use client';

import React from 'react';
import Logo from '@/components/brand/Logo';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { SERVICE_IDS } from '@/lib/i18n/dict';

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t-2 border-navy-line/60 bg-navy-night">
      <div className="brand-rule absolute -top-[2px] left-0 right-0 text-navy" aria-hidden />
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="lockup" dark className="w-[240px]" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-steel-500">{t.hero.sub}</p>
          </div>

          <nav aria-label={t.footer.services}>
            <span className="tech-label text-steel-500">{t.footer.services}</span>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SERVICE_IDS.map((id) => (
                <li key={id}>
                  <a href="#demonstration" className="text-sm text-steel-300 transition-colors hover:text-brand-orange">
                    {t.services[id].name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.company}>
            <span className="tech-label text-steel-500">{t.footer.company}</span>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><a href="#qui-sommes-nous" className="text-sm text-steel-300 transition-colors hover:text-brand-orange">{t.footer.about}</a></li>
              <li><a href="#methode" className="text-sm text-steel-300 transition-colors hover:text-brand-orange">{t.footer.method}</a></li>
              <li><a href="#interventions" className="text-sm text-steel-300 transition-colors hover:text-brand-orange">{t.footer.interventions}</a></li>
              <li><a href="#contact" className="text-sm text-steel-300 transition-colors hover:text-brand-orange">{t.footer.contact}</a></li>
            </ul>
          </nav>

          <div>
            <span className="tech-label text-steel-500">{t.footer.contact}</span>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-steel-300">
              <li>
                <a href={`tel:${t.contact.phoneNumber.replace(/\s/g, '')}`} className="font-mono transition-colors hover:text-brand-orange">
                  {t.contact.phoneNumber}
                </a>
              </li>
              <li>
                <a href={`mailto:${t.contact.emailAddress}`} className="break-all font-mono transition-colors hover:text-brand-orange">
                  {t.contact.emailAddress}
                </a>
              </li>
              <li className="text-steel-500">{t.contact.address}</li>
              <li className="text-steel-500">{t.contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-navy-line/40 pt-6">
          <p className="text-xs text-steel-700">
            © {year} MECANORME — {t.footer.tagline}. {t.footer.rights}
          </p>
          <a href="#top" className="group flex items-center gap-2">
            <span className="tech-label text-steel-500 transition-colors group-hover:text-brand-orange">{t.footer.top}</span>
            <span className="tri-marker" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
