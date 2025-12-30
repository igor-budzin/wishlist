import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  commonEn,
  errorsEn,
  validationEn,
  commonUk,
  errorsUk,
  validationUk,
  supportedLanguages,
  defaultNS,
  type I18nResources,
} from '@wishlist/shared/i18n';

// TypeScript module augmentation for i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: I18nResources;
  }
}

/**
 * Initialize i18next for frontend
 */
export function initI18n() {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common: commonEn,
          errors: errorsEn,
          validation: validationEn,
        },
        uk: {
          common: commonUk,
          errors: errorsUk,
          validation: validationUk,
        },
      },
      defaultNS,
      fallbackLng: 'en',
      supportedLngs: supportedLanguages,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      detection: {
        // Order of language detection
        order: ['localStorage', 'navigator'],
        // Cache user language in localStorage
        caches: ['localStorage'],
        // localStorage key
        lookupLocalStorage: 'lang',
      },
      returnNull: false,
      returnEmptyString: false,
    });
}

export default i18next;
