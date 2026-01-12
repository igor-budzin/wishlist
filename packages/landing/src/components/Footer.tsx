import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation('landing');

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex flex-col items-center space-y-6">
          <a href="/" className="text-2xl text-white hover:text-gray-200 transition-colors">
            {t('footer.brandName')}
          </a>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/about" className="text-sm hover:text-white transition-colors">
              {t('footer.aboutUs')}
            </a>
            <a href="/privacy-policy" className="text-sm hover:text-white transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="/terms-of-service" className="text-sm hover:text-white transition-colors">
              {t('footer.termsOfService')}
            </a>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <LanguageSwitcher />
          </div>
          <p className="text-sm">&copy; {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
