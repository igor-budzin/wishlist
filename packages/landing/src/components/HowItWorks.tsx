import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Sparkles, Share2 } from 'lucide-react';

export function HowItWorks() {
  const { t } = useTranslation('landing');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('#how-it-works .scroll-animate').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gray-50" id="how-it-works">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate">
          <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="relative scroll-animate" style={{ '--delay': '0ms' } as React.CSSProperties}>
            <div className="text-center space-y-4 group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4F46E5] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gift className="size-10" />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-xl -z-10 opacity-20">
                1
              </div>
              <h3 className="text-2xl text-gray-900 pt-4">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step1.description')}
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] opacity-30 connector-line"></div>
          </div>

          {/* Step 2 */}
          <div className="relative scroll-animate" style={{ '--delay': '150ms' } as React.CSSProperties}>
            <div className="text-center space-y-4 group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6366F1] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="size-10" />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-xl -z-10 opacity-20">
                2
              </div>
              <h3 className="text-2xl text-gray-900 pt-4">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step2.description')}
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] opacity-30 connector-line"></div>
          </div>

          {/* Step 3 */}
          <div className="relative scroll-animate" style={{ '--delay': '300ms' } as React.CSSProperties}>
            <div className="text-center space-y-4 group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4F46E5] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Share2 className="size-10" />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-xl -z-10 opacity-20">
                3
              </div>
              <h3 className="text-2xl text-gray-900 pt-4">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
