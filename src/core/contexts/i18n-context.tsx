import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import plMessages from '../../translations/pl.json';
import enMessages from '../../translations/en.json';
import deMessages from '../../translations/de.json';
import { SupportedLocale, useLocaleContext } from './locale-context.tsx';

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocaleContext();

  const messages = useMemo(() => {
    switch (locale) {
      case SupportedLocale.PL:
        return plMessages;

      case SupportedLocale.EN:
        return enMessages;

      case SupportedLocale.DE:
        return deMessages;
    }
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};
