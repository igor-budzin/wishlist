import { useTranslation } from 'react-i18next';
import { Target, Sparkles, BookOpen, Heart, Shield, Lightbulb, Mail } from 'lucide-react';

const valueIcons = {
  simplicity: Sparkles,
  privacy: Shield,
  innovation: Lightbulb,
  joy: Heart,
} as const;

type ValueKey = keyof typeof valueIcons;

export function AboutPage() {
  const { t } = useTranslation('landing');

  const values: ValueKey[] = ['simplicity', 'privacy', 'innovation', 'joy'];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">{t('about.hero.title')}</h1>
          <p className="text-xl md:text-2xl text-indigo-100">{t('about.hero.subtitle')}</p>
        </div>
      </section>

      <main className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-5xl">
          {/* Mission Section */}
          <section className="mb-20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center shrink-0">
                <Target className="size-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl text-gray-900 mb-4">{t('about.mission.title')}</h2>
                <p className="text-lg text-gray-600">{t('about.mission.description')}</p>
              </div>
            </div>
          </section>

          {/* What We Do Section */}
          <section className="mb-20">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles className="size-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl text-gray-900 mb-4">{t('about.whatWeDo.title')}</h2>
                <p className="text-lg text-gray-600 mb-4">{t('about.whatWeDo.description1')}</p>
                <p className="text-lg text-gray-600">{t('about.whatWeDo.description2')}</p>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="mb-20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen className="size-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl text-gray-900 mb-4">{t('about.ourStory.title')}</h2>
                <p className="text-lg text-gray-600 mb-4">{t('about.ourStory.description1')}</p>
                <p className="text-lg text-gray-600">{t('about.ourStory.description2')}</p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <h2 className="text-3xl text-gray-900 mb-12 text-center">{t('about.values.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((valueKey) => {
                const Icon = valueIcons[valueKey];
                return (
                  <div
                    key={valueKey}
                    className="group p-6 rounded-2xl border border-gray-200 hover:border-[#4F46E5] hover:shadow-lg transition-all duration-300 cursor-default bg-white"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#4F46E5] transition-colors duration-300">
                        <Icon className="size-6 text-[#4F46E5] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-xl text-gray-900 mb-2 group-hover:text-[#4F46E5] transition-colors duration-300">
                          {t(`about.values.${valueKey}.title`)}
                        </h3>
                        <p className="text-gray-600">{t(`about.values.${valueKey}.description`)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <div className="about-contact-section bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="about-particle about-particle-1"></div>
                <div className="about-particle about-particle-2"></div>
                <div className="about-particle about-particle-3"></div>
                <div className="about-particle about-particle-4"></div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl about-floating-circle"></div>
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl about-floating-circle-delayed"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 about-pulse-icon">
                  <Mail className="size-8 text-white" />
                </div>
                <h2 className="text-3xl mb-4">{t('about.contact.title')}</h2>
                <p className="text-lg text-indigo-100 mb-6 max-w-xl mx-auto">
                  {t('about.contact.description')}
                </p>
                <a
                  href="mailto:hello@wishmaster.app"
                  className="about-contact-button inline-flex items-center gap-2 bg-white text-[#4F46E5] px-8 py-3 rounded-full text-lg font-medium hover:bg-indigo-50 transition-all duration-300"
                >
                  <Mail className="size-5" />
                  hello@wishmaster.app
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        /* Floating particles */
        .about-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        .about-particle-1 {
          top: 20%;
          left: 10%;
          animation: aboutParticleFloat 8s ease-in-out infinite;
        }

        .about-particle-2 {
          top: 60%;
          left: 80%;
          animation: aboutParticleFloat 10s ease-in-out infinite;
          animation-delay: -2s;
        }

        .about-particle-3 {
          top: 80%;
          left: 20%;
          animation: aboutParticleFloat 12s ease-in-out infinite;
          animation-delay: -4s;
        }

        .about-particle-4 {
          top: 30%;
          left: 70%;
          animation: aboutParticleFloat 9s ease-in-out infinite;
          animation-delay: -6s;
        }

        @keyframes aboutParticleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(20px, -30px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-10px, -60px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.5;
          }
        }

        /* Floating circles */
        @keyframes aboutFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(20px, -20px) rotate(5deg);
          }
          66% {
            transform: translate(-10px, 10px) rotate(-5deg);
          }
        }

        .about-floating-circle {
          animation: aboutFloat 8s ease-in-out infinite;
        }

        .about-floating-circle-delayed {
          animation: aboutFloat 10s ease-in-out infinite;
          animation-delay: -5s;
        }

        /* Pulse animation for mail icon */
        @keyframes aboutIconBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .about-pulse-icon {
          animation: aboutIconBounce 2s ease-in-out infinite;
        }

        /* Contact button */
        .about-contact-button {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
        }

        .about-contact-button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .about-contact-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(79, 70, 229, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease-out, height 0.6s ease-out;
        }

        .about-contact-button:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </>
  );
}
