import type { Request, Response, NextFunction } from 'express';
import { parseAcceptLanguage, getTranslator } from '../config/i18n.js';
import type { SupportedLanguage } from '@wishlist/shared/i18n';

/**
 * Extend Express Request to include language and translator
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      language: SupportedLanguage;
      t: ReturnType<typeof getTranslator>;
    }
  }
}

/**
 * Middleware to detect language from Accept-Language header
 * and attach translator function to request
 */
export function languageMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const acceptLanguage = req.headers['accept-language'];
  const language = parseAcceptLanguage(acceptLanguage);

  // Attach language and translator to request
  req.language = language;
  req.t = getTranslator(language);

  next();
}
