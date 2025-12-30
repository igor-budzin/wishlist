import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supportedLanguages } from '@wishlist/shared/i18n';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (language: string) => {
    await i18n.changeLanguage(language);
    // Get the translation in the NEW language after change
    const message = i18n.t('profile.languageChanged');
    toast.success(message);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {t(`languages.${lang}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
