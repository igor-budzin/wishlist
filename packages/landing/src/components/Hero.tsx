import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  loginUrl: string;
}

export function Hero({ loginUrl }: HeroProps) {
  const { t } = useTranslation('landing');

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white pt-32 md:pt-40"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl tracking-tight hero-animate"
              style={{ '--delay': '0ms' } as React.CSSProperties}
            >
              {t('hero.title')}
            </h1>
            <p
              className="text-xl md:text-2xl text-indigo-100 hero-animate"
              style={{ '--delay': '150ms' } as React.CSSProperties}
            >
              {t('hero.subtitle')}
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 pt-4 hero-animate"
              style={{ '--delay': '300ms' } as React.CSSProperties}
            >
              <a
                href={loginUrl}
                className="bg-white text-[#4F46E5] hover:bg-gray-100 hover:scale-105 rounded-full px-8 text-lg h-12 inline-flex items-center justify-center font-medium transition-all duration-300"
              >
                {t('hero.cta')}
              </a>
            </div>
          </div>
          <div
            className="relative hero-animate-right"
            style={{ '--delay': '200ms' } as React.CSSProperties}
          >
            {/* App Mockup Placeholder */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4 hover:shadow-3xl transition-shadow duration-300 mockup-card">
              <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center sparkle-icon">
                    <Sparkles className="size-10 text-white" />
                  </div>
                  <p className="text-gray-600 text-lg">{t('hero.appName')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('hero.mockupPlaceholder')}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-50 floating-blob"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-50 floating-blob-delayed"></div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="wave-animation"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F9FAFB"
          />
        </svg>
      </div>
    </section>
  );
}
