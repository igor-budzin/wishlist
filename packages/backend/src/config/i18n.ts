import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { fileURLToPath } from 'url';
import { supportedLanguages, defaultNS, type I18nResources } from '@wishlist/shared/i18n';
import type { SupportedLanguage } from '@wishlist/shared/i18n';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TypeScript module augmentation for i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: I18nResources;
  }
}

/**
 * Initialize i18next for backend
 * Must be called before server starts
 */
export async function initI18n(): Promise<void> {
  await i18next
    .use(Backend)
    .init({
      lng: 'en', // default language
      fallbackLng: 'en',
      defaultNS,
      ns: ['common', 'errors', 'validation'],
      supportedLngs: supportedLanguages,
      preload: supportedLanguages,
      backend: {
        // Path to translation files in shared package
        loadPath: path.join(__dirname, '../../../shared/i18n/locales/{{lng}}/{{ns}}.json'),
      },
      interpolation: {
        escapeValue: false, // not needed for server-side
      },
      returnNull: false,
      returnEmptyString: false,
    });
}

/**
 * Parse Accept-Language header and return best matching language
 * @param acceptLanguageHeader - Accept-Language header value
 * @returns Supported language code
 */
export function parseAcceptLanguage(acceptLanguageHeader?: string): SupportedLanguage {
  if (!acceptLanguageHeader) {
    return 'en';
  }

  // Parse Accept-Language header format: "en-US,en;q=0.9,uk;q=0.8"
  const languages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      // Extract base language code (e.g., "en" from "en-US")
      const baseCode = code.split('-')[0].toLowerCase();
      return { code: baseCode, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported language
  for (const lang of languages) {
    if (supportedLanguages.includes(lang.code as SupportedLanguage)) {
      return lang.code as SupportedLanguage;
    }
  }

  return 'en'; // fallback
}

/**
 * Get translation function for a specific language
 * @param language - Language code
 * @returns Translation function
 */
export function getTranslator(language: SupportedLanguage) {
  return i18next.getFixedT(language);
}

export default i18next;
