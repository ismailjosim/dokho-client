'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'bn' | 'en';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'bn';

    const savedLanguage = window.localStorage.getItem('dokho_language');

    if (savedLanguage === 'bn' || savedLanguage === 'en') {
      return savedLanguage;
    }

    return 'bn';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('dokho_language', language);
  }, [language]);

  useEffect(() => {
    function syncLanguage(event: StorageEvent) {
      if (event.key !== 'dokho_language') return;
      if (event.newValue === 'bn' || event.newValue === 'en') {
        setLanguageState(event.newValue);
      }
    }

    window.addEventListener('storage', syncLanguage);

    return () => window.removeEventListener('storage', syncLanguage);
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
  }

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
