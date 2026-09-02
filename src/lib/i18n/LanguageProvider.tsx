'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dicts, type Dict, type Lang } from './dict';

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };

const LanguageContext = createContext<Ctx>({ lang: 'fr', t: dicts.fr, setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('mecanorme-lang');
      if (saved === 'en' || saved === 'fr') setLangState(saved);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('mecanorme-lang', l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, t: dicts[lang], setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
