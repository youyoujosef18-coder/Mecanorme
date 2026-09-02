'use client';

import React, { useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageProvider';
import { Reveal, SectionHeader } from '@/components/ui/primitives';
import { SERVICE_IDS } from '@/lib/i18n/dict';

export default function Contact() {
  const { t } = useLang();
  const [service, setService] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '');
    const company = String(data.get('company') ?? '');
    const email = String(data.get('email') ?? '');
    const phone = String(data.get('phone') ?? '');
    const svc = String(data.get('service') ?? '');
    const message = String(data.get('message') ?? '');
    const subject = encodeURIComponent(`[MECANORME] ${t.contact.title} — ${name}${company ? ` (${company})` : ''}`);
    const body = encodeURIComponent(
      `${t.contact.name}: ${name}\n${t.contact.company}: ${company}\n${t.contact.email}: ${email}\n${t.contact.phone}: ${phone}\n${t.contact.service}: ${svc}\n\n${message}`
    );
    window.location.href = `mailto:${t.contact.emailAddress}?subject=${subject}&body=${body}`;
  };

  const inputCls =
    'w-full border border-navy-line/60 bg-navy-deep/60 px-4 py-3.5 text-sm text-paper placeholder:text-steel-700 focus:border-brand-orange focus:outline-none transition-colors';

  return (
    <section id="contact" className="relative bg-navy-night py-24 lg:py-32">
      <div className="grid-bg-dark absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8">
        <SectionHeader kicker={t.contact.kicker} title={t.contact.title} sub={t.contact.sub} index="07" />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          {/* direct details */}
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <div className="chamfer border border-navy-line/60 bg-navy-deep/60 p-6">
                <span className="tech-label text-steel-500">{t.contact.direct}</span>
                <div className="mt-5 flex flex-col gap-5">
                  <a href={`tel:${t.contact.phoneNumber.replace(/\s/g, '')}`} className="group flex items-center justify-between gap-4">
                    <div>
                      <span className="tech-label text-steel-500">{t.contact.call}</span>
                      <p className="mt-1 font-mono text-lg font-bold text-paper transition-colors group-hover:text-brand-orange">
                        {t.contact.phoneNumber}
                      </p>
                    </div>
                    <span className="tri-marker-right transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                  <div className="dim-line text-navy-line" aria-hidden />
                  <a href={`mailto:${t.contact.emailAddress}`} className="group flex items-center justify-between gap-4">
                    <div>
                      <span className="tech-label text-steel-500">{t.contact.write}</span>
                      <p className="mt-1 break-all font-mono text-sm font-bold text-paper transition-colors group-hover:text-brand-orange sm:text-base">
                        {t.contact.emailAddress}
                      </p>
                    </div>
                    <span className="tri-marker-right transition-transform group-hover:translate-x-1" aria-hidden />
                  </a>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="border border-navy-line/60 p-6">
                  <span className="tech-label text-steel-500">{t.contact.addressTitle}</span>
                  <p className="mt-3 text-sm leading-relaxed text-steel-300">{t.contact.address}</p>
                </div>
                <div className="border border-navy-line/60 p-6">
                  <span className="tech-label text-steel-500">{t.contact.hoursTitle}</span>
                  <p className="mt-3 text-sm leading-relaxed text-steel-300">{t.contact.hours}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="led led-ok led-pulse text-ok" aria-hidden />
                    <span className="tech-label text-steel-500">{t.hero.statusOnline}</span>
                  </div>
                </div>
              </div>

              {/* coverage strip fills the column and adds a last reassurance before the form */}
              <div className="chamfer mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 border border-navy-line/60 bg-navy-deep/40 p-6">
                <span className="tri-marker" aria-hidden />
                <span className="text-sm text-steel-300">{t.intro.coverage}</span>
                <span className="tech-label ml-auto text-steel-700">{t.intro.based}</span>
              </div>
            </div>
          </Reveal>

          {/* form */}
          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="chamfer border border-navy-line/60 bg-navy-deep/40 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-name" className="tech-label mb-2 block text-steel-500">
                    {t.contact.name} *
                  </label>
                  <input id="f-name" name="name" required autoComplete="name" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="f-company" className="tech-label mb-2 block text-steel-500">
                    {t.contact.company}
                  </label>
                  <input id="f-company" name="company" autoComplete="organization" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="f-email" className="tech-label mb-2 block text-steel-500">
                    {t.contact.email} *
                  </label>
                  <input id="f-email" name="email" type="email" required autoComplete="email" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="f-phone" className="tech-label mb-2 block text-steel-500">
                    {t.contact.phone}
                  </label>
                  <input id="f-phone" name="phone" type="tel" autoComplete="tel" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-service" className="tech-label mb-2 block text-steel-500">
                    {t.contact.service}
                  </label>
                  <select
                    id="f-service"
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">—</option>
                    {SERVICE_IDS.map((id) => (
                      <option key={id} value={t.services[id].name}>
                        {t.services[id].name}
                      </option>
                    ))}
                    <option value={t.contact.serviceAll}>{t.contact.serviceAll}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-message" className="tech-label mb-2 block text-steel-500">
                    {t.contact.message} *
                  </label>
                  <textarea id="f-message" name="message" required rows={5} placeholder={t.contact.messagePh} className={inputCls} />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xs text-[11px] leading-relaxed text-steel-700">{t.contact.submitNote}</p>
                <button
                  type="submit"
                  className="chamfer-sm inline-flex items-center gap-3 bg-brand-orange px-8 py-4 text-sm font-bold uppercase tracking-wider2 text-white transition-colors hover:bg-brand-amber"
                >
                  <span className="tri-marker-right !border-l-white" aria-hidden />
                  {t.contact.submit}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
