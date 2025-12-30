/**
 * i18next type definitions for translation namespaces
 */

import type common from './locales/en/common.json';
import type errors from './locales/en/errors.json';
import type validation from './locales/en/validation.json';

export interface I18nResources {
  common: typeof common;
  errors: typeof errors;
  validation: typeof validation;
}

export type I18nNamespace = keyof I18nResources;

export const defaultNS: I18nNamespace = 'common';
export const supportedLanguages = ['en', 'uk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
