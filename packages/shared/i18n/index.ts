/**
 * Shared i18n configuration and types
 */

export * from './types.js';
export { defaultNS, supportedLanguages } from './types.js';
export { default as commonEn } from './locales/en/common.json' with { type: 'json' };
export { default as errorsEn } from './locales/en/errors.json' with { type: 'json' };
export { default as validationEn } from './locales/en/validation.json' with { type: 'json' };
export { default as commonUk } from './locales/uk/common.json' with { type: 'json' };
export { default as errorsUk } from './locales/uk/errors.json' with { type: 'json' };
export { default as validationUk } from './locales/uk/validation.json' with { type: 'json' };
