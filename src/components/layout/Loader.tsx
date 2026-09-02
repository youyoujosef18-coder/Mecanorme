'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '@/components/brand/Logo';
import { useLang } from '@/lib/i18n/LanguageProvider';

/** Short, non-blocking branded boot screen. Never shown again once the page is usable. */
export default function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    let mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const el = performance.now() - start;
      const p = Math.min(100, Math.round((el / 900) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
      else setTimeout(() => mounted && setDone(true), 260);
    };
    requestAnimationFrame(tick);
    // hard cap — never block the page
    const cap = setTimeout(() => mounted && setDone(true), 2200);
    return () => {
      mounted = false;
      clearTimeout(cap);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-8 bg-navy-night"
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          aria-hidden
        >
          <Logo variant="word" dark className="w-[min(420px,70vw)]" />
          <div className="w-[min(320px,60vw)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="tech-label text-steel-500">{t.loader.boot}</span>
              <span className="tech-label text-brand-orange">{progress}%</span>
            </div>
            <div className="h-[3px] w-full bg-navy-line/50">
              <div
                className="h-full bg-brand-orange transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
