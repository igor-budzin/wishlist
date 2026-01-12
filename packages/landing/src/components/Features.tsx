import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock, Share2, Smartphone, Shield, Link2 } from 'lucide-react';

const featureKeys = [
  { key: 'aiDescription', icon: 'sparkles' },
  { key: 'easyManagement', icon: 'clock' },
  { key: 'seamlessSharing', icon: 'share' },
  { key: 'mobileFriendly', icon: 'smartphone' },
  { key: 'secureStorage', icon: 'shield' },
  { key: 'universalLinks', icon: 'link' },
] as const;

export function Features() {
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

    document.querySelectorAll('#features .scroll-animate-features').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles className="size-7 text-white" />;
      case 'clock': return <Clock className="size-7 text-white" />;
      case 'share': return <Share2 className="size-7 text-white" />;
      case 'smartphone': return <Smartphone className="size-7 text-white" />;
      case 'shield': return <Shield className="size-7 text-white" />;
      case 'link': return <Link2 className="size-7 text-white" />;
      default: return null;
    }
  };

  return (
    <section className="py-20 md:py-32 bg-white" id="features">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center max-w-3xl mx-auto mb-16 scroll-animate-features">
          <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureKeys.map((feature, index) => (
            <div
              key={feature.key}
              className="p-8 rounded-2xl bg-gray-50 hover:shadow-xl transition-all duration-300 scroll-animate-features hover:-translate-y-1"
              style={{ '--delay': `${index * 100}ms` } as React.CSSProperties}
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center mb-4 feature-icon">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl mb-2 text-gray-900">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-gray-600">
                {t(`features.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
