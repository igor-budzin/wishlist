import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider, type I18nextProviderProps } from 'react-i18next';
import i18next, { initI18n } from '../lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initI18n();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18next as I18nextProviderProps['i18n']}>
      {children}
    </I18nextProvider>
  );
}
