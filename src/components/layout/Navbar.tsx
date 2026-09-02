'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';
import { useLang } from '@/lib/i18n/LanguageProvider';

const LINKS = [
  { href: '#metiers', key: 'services' },
  { href: '#demonstration', key: 'demo' },
  { href: '#methode', key: 'process' },
  { href: '#interventions', key: 'projects' },
  { href: '#contact', key: 'contact' },
] as const;

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:bg-brand-orange focus:px-4 focus:py-2 focus:text-white"
      >
        {t.misc.skipToContent}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[100] border-b transition-all duration-300 ${
          scrolled
            ? 'border-navy-line/60 bg-navy-night/85 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className={`mx-auto flex max-w-[1500px] items-center justify-between px-5 transition-all duration-300 sm:px-8 ${scrolled ? 'h-16' : 'h-20'}`}>
          <a href="#top" aria-label="MECANORME" className="mr-3 min-w-0 shrink">
            <Logo
              variant="word"
              dark
              className={`w-auto max-w-full transition-all duration-300 ${scrolled ? 'h-[18px] sm:h-[22px]' : 'h-[20px] sm:h-[26px]'}`}
            />
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="principal">
            {LINKS.map((l) => (
              <a
                key={l.key}
                href={l.href}
                className="tech-label text-steel-300 transition-colors hover:text-brand-orange"
              >
                {t.nav[l.key]}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* language toggle */}
            <div className="flex items-center border border-navy-line" role="group" aria-label={t.misc.langLabel}>
              {(['fr', 'en'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`tech-label px-2.5 py-1.5 transition-colors ${
                    lang === l ? 'bg-brand-orange text-white' : 'text-steel-500 hover:text-paper'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <a
              href="#contact"
              className="chamfer-sm hidden items-center gap-2 bg-brand-orange px-5 py-2.5 text-xs font-bold uppercase tracking-wider2 text-white transition-colors hover:bg-brand-amber sm:inline-flex"
            >
              {t.nav.quote}
            </a>

            {/* mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.menu}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-navy-line lg:hidden"
            >
              <span className="h-[2px] w-5 bg-paper" />
              <span className="h-[2px] w-5 bg-brand-orange" />
              <span className="h-[2px] w-5 bg-paper" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col bg-navy-night"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex h-20 items-center justify-between px-5">
              <Logo variant="word" dark className="h-[24px] w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.close}
                className="tech-label border border-navy-line px-4 py-2 text-steel-300"
              >
                {t.nav.close} ✕
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-8" aria-label="mobile">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.key}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 border-b border-navy-line/40 py-4"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <span className="tech-label text-brand-orange">0{i + 1}</span>
                  <span className="font-display text-3xl font-bold uppercase text-paper group-hover:text-brand-orange">
                    {t.nav[l.key]}
                  </span>
                </motion.a>
              ))}
            </nav>
            <div className="px-8 pb-10">
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="chamfer-sm block bg-brand-orange px-6 py-4 text-center text-sm font-bold uppercase tracking-wider2 text-white"
              >
                {t.nav.quote}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
