import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { changeLanguage, getLanguageOptions, getCurrentLanguage, type SupportedLanguage } from '../lib/i18n';

export function LanguageSwitcher() {
  const { t } = useTranslation('landing');
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languages = getLanguageOptions();

  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    changeLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
  };

  const currentLanguage = languages.find((l) => l.code === currentLang);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
        aria-label={t('footer.language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="size-4" />
        <span>{currentLanguage?.name}</span>
        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg py-1 min-w-[140px] border border-gray-700"
          role="listbox"
          aria-label={t('footer.language')}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang.code === currentLang
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              role="option"
              aria-selected={lang.code === currentLang}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
