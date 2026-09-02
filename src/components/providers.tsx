'use client';

import React from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { CursorProvider } from '@/components/ui/CustomCursor';
import Loader from '@/components/layout/Loader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CursorProvider>
        <Loader />
        {children}
      </CursorProvider>
    </LanguageProvider>
  );
}
