import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CTAProps {
  loginUrl: string;
}

export function CTA({ loginUrl }: CTAProps) {
  const { t } = useTranslation('landing');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate-cta').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl floating-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl floating-blob-delayed"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl scroll-animate-cta">{t('cta.title')}</h2>
          <p
            className="text-xl md:text-2xl text-indigo-100 scroll-animate-cta"
            style={{ '--delay': '100ms' } as React.CSSProperties}
          >
            {t('cta.subtitle')}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 scroll-animate-cta"
            style={{ '--delay': '200ms' } as React.CSSProperties}
          >
            <a
              href={loginUrl}
              className="bg-white text-[#4F46E5] hover:bg-gray-100 hover:scale-105 rounded-full px-10 text-lg h-12 inline-flex items-center justify-center font-medium transition-all duration-300 cta-button"
            >
              {t('cta.button')}
            </a>
          </div>
          <p
            className="text-sm text-indigo-200 scroll-animate-cta"
            style={{ '--delay': '300ms' } as React.CSSProperties}
          >
            {t('cta.noCreditCard')}
          </p>
        </div>
      </div>
    </section>
  );
}
