import { useTranslation } from 'react-i18next';

export function PrivacyPolicyPage() {
  const { t } = useTranslation('landing');

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl mb-8 text-gray-900">{t('privacyPolicy.title')}</h1>
        <p className="text-gray-600 mb-8">{t('privacyPolicy.lastUpdated')}</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.introduction.title')}
            </h2>
            <p>{t('privacyPolicy.sections.introduction.content')}</p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.informationWeCollect.title')}
            </h2>
            <p>{t('privacyPolicy.sections.informationWeCollect.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.informationWeCollect.items.account'),
                }}
              />
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.informationWeCollect.items.wishlist'),
                }}
              />
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.informationWeCollect.items.usage'),
                }}
              />
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.informationWeCollect.items.device'),
                }}
              />
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.howWeUse.title')}
            </h2>
            <p>{t('privacyPolicy.sections.howWeUse.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacyPolicy.sections.howWeUse.items.provide')}</li>
              <li>{t('privacyPolicy.sections.howWeUse.items.process')}</li>
              <li>{t('privacyPolicy.sections.howWeUse.items.generate')}</li>
              <li>{t('privacyPolicy.sections.howWeUse.items.send')}</li>
              <li>{t('privacyPolicy.sections.howWeUse.items.respond')}</li>
              <li>{t('privacyPolicy.sections.howWeUse.items.protect')}</li>
            </ul>
          </section>

          {/* 4. Data Sharing */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.dataSharing.title')}
            </h2>
            <p>{t('privacyPolicy.sections.dataSharing.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.dataSharing.items.serviceProviders'),
                }}
              />
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.dataSharing.items.legal'),
                }}
              />
              <li
                dangerouslySetInnerHTML={{
                  __html: t('privacyPolicy.sections.dataSharing.items.consent'),
                }}
              />
            </ul>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.dataSecurity.title')}
            </h2>
            <p>{t('privacyPolicy.sections.dataSecurity.content')}</p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.yourRights.title')}
            </h2>
            <p>{t('privacyPolicy.sections.yourRights.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacyPolicy.sections.yourRights.items.access')}</li>
              <li>{t('privacyPolicy.sections.yourRights.items.correct')}</li>
              <li>{t('privacyPolicy.sections.yourRights.items.delete')}</li>
              <li>{t('privacyPolicy.sections.yourRights.items.export')}</li>
              <li>{t('privacyPolicy.sections.yourRights.items.optOut')}</li>
            </ul>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.cookies.title')}
            </h2>
            <p>{t('privacyPolicy.sections.cookies.content')}</p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.childrensPrivacy.title')}
            </h2>
            <p>{t('privacyPolicy.sections.childrensPrivacy.content')}</p>
          </section>

          {/* 9. Changes to This Policy */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.changes.title')}
            </h2>
            <p>{t('privacyPolicy.sections.changes.content')}</p>
          </section>

          {/* 10. Contact Us */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('privacyPolicy.sections.contact.title')}
            </h2>
            <p>{t('privacyPolicy.sections.contact.content')}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
