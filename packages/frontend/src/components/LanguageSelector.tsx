import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { supportedLanguages } from '@wishlist/shared/i18n';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    toast.success(t('profile.languageChanged'));
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