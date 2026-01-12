import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, Image as ImageIcon, ArrowRight } from 'lucide-react';

export function SeeInAction() {
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

    document.querySelectorAll('#see-in-action .scroll-animate-action').forEach(el => {
      observer.observe(el);
    });

    document.querySelectorAll('#see-in-action .after-card').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-white" id="see-in-action">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate-action">
          <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">{t('seeInAction.title')}</h2>
          <p className="text-xl text-gray-600">
            {t('seeInAction.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Before & After Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
            {/* Before */}
            <div className="space-y-4 scroll-animate-action" style={{ '--delay': '100ms' } as React.CSSProperties}>
              <div className="bg-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl mb-3 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">&#10060;</span> {t('seeInAction.before.title')}
                </h3>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 text-gray-400" />
                    <p className="text-sm text-gray-500 font-mono break-all">
                      {t('seeInAction.before.exampleUrl')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400 italic">
                    {t('seeInAction.before.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow indicator for desktop */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
              <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center arrow-pulse">
                <ArrowRight className="size-6 text-white" />
              </div>
            </div>

            {/* After */}
            <div className="space-y-4 scroll-animate-action" style={{ '--delay': '300ms' } as React.CSSProperties}>
              <div
                className="bg-gradient-to-br from-[#4F46E5]/10 to-[#6366F1]/10 rounded-xl p-6 border-2 border-[#4F46E5]/20 hover:shadow-lg hover:border-[#4F46E5]/40 transition-all duration-300 after-card"
              >
                <h3 className="text-xl mb-3 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl sparkle-animation">&#10024;</span> {t('seeInAction.after.title')}
                </h3>
                <div className="bg-white rounded-lg p-4 space-y-3 shadow-lg">
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-lg flex items-center justify-center shrink-0 image-placeholder"
                    >
                      <ImageIcon className="size-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-1">{t('seeInAction.after.productTitle')}</h4>
                      <p className="text-sm text-gray-600">
                        {t('seeInAction.after.productDescription')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-[#4F46E5]/10 text-[#4F46E5] rounded-full tag-animation">
                      {t('seeInAction.after.category')}
                    </span>
                    <span className="text-gray-900 price-animation">$299</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
