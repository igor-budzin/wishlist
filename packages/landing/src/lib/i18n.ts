import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  landingEn,
  landingUk,
  commonEn,
  commonUk,
  supportedLanguages,
  type SupportedLanguage,
} from '@wishlist/shared/i18n';

const LANG_STORAGE_KEY = 'lang';

let initPromise: Promise<typeof i18next> | null = null;

/**
 * Initialize i18next for landing page
 */
export function initI18n(): Promise<typeof i18next> {
  if (i18next.isInitialized) {
    return Promise.resolve(i18next);
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          landing: landingEn,
          common: commonEn,
        },
        uk: {
          landing: landingUk,
          common: commonUk,
        },
      },
      defaultNS: 'landing',
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
        // localStorage key (same as frontend for consistency)
        lookupLocalStorage: LANG_STORAGE_KEY,
      },
      returnNull: false,
      returnEmptyString: false,
    })
    .then(() => i18next);

  return initPromise;
}

/**
 * Change the current language
 */
export function changeLanguage(lang: SupportedLanguage) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  i18next.changeLanguage(lang);
  // Update the HTML lang attribute
  document.documentElement.lang = lang;
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return (i18next.language || 'en') as SupportedLanguage;
}

/**
 * Get all supported languages with their display names
 */
export function getLanguageOptions() {
  return [
    { code: 'en' as const, name: 'English' },
    { code: 'uk' as const, name: 'Українська' },
  ];
}

export { supportedLanguages };
export type { SupportedLanguage };
export default i18next;
