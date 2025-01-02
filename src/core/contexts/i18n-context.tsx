import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from '../../translations/en.json';
import plMessages from '../../translations/pl.json';
import { SupportedLocale, useLocaleContext } from './locale-context.tsx';

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocaleContext();

  const messages = useMemo(() => {
    switch (locale) {
      case SupportedLocale.PL:
        return plMessages;

      case SupportedLocale.EN:
        return enMessages;
    }
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};
