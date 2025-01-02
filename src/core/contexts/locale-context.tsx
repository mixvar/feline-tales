/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState, useContext } from 'react';

export enum SupportedLocale {
  PL = 'pl-PL',
  EN = 'en-US',
}

interface LocaleContextPayload {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const LOCALE_STORAGE_KEY = 'app-locale';

const LocaleContext = createContext<LocaleContextPayload | null>(null);

export const LocaleContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale | null;
    return savedLocale ?? resolveDefaultLocale();
  });

  const handleSetLocale = (newLocale: SupportedLocale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocale(newLocale);
  };

  const ctx = useMemo(
    (): LocaleContextPayload => ({ locale, setLocale: handleSetLocale }),
    [locale]
  );

  return <LocaleContext.Provider value={ctx}>{children}</LocaleContext.Provider>;
};

export const useLocaleContext = (): LocaleContextPayload => {
  const context = useContext(LocaleContext);

  if (context === null) {
    throw new Error('useLocale must be used within a LocaleContextProvider');
  }

  return context;
};

const resolveDefaultLocale = () => {
  const browserLocale = navigator.language;

  if (browserLocale.toLowerCase().startsWith('pl')) {
    return SupportedLocale.PL;
  }

  return SupportedLocale.EN;
};
