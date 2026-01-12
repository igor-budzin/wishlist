import { useTranslation } from 'react-i18next';

export function TermsOfServicePage() {
  const { t } = useTranslation('landing');

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl mb-8 text-gray-900">{t('termsOfService.title')}</h1>
        <p className="text-gray-600 mb-8">{t('termsOfService.lastUpdated')}</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.acceptance.title')}
            </h2>
            <p>{t('termsOfService.sections.acceptance.content')}</p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.description.title')}
            </h2>
            <p>{t('termsOfService.sections.description.content')}</p>
          </section>

          {/* 3. User Accounts */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.userAccounts.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('termsOfService.sections.userAccounts.items.accurate')}</li>
              <li>{t('termsOfService.sections.userAccounts.items.security')}</li>
              <li>{t('termsOfService.sections.userAccounts.items.notify')}</li>
            </ul>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.acceptableUse.title')}
            </h2>
            <p>{t('termsOfService.sections.acceptableUse.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('termsOfService.sections.acceptableUse.items.illegal')}</li>
              <li>{t('termsOfService.sections.acceptableUse.items.malicious')}</li>
              <li>{t('termsOfService.sections.acceptableUse.items.harass')}</li>
              <li>{t('termsOfService.sections.acceptableUse.items.violate')}</li>
              <li>{t('termsOfService.sections.acceptableUse.items.reverseEngineer')}</li>
              <li>{t('termsOfService.sections.acceptableUse.items.automated')}</li>
            </ul>
          </section>

          {/* 5. User Content */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.userContent.title')}
            </h2>
            <p>{t('termsOfService.sections.userContent.content1')}</p>
            <p className="mt-4">{t('termsOfService.sections.userContent.content2')}</p>
          </section>

          {/* 6. AI-Generated Content */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.aiContent.title')}
            </h2>
            <p>{t('termsOfService.sections.aiContent.content')}</p>
          </section>

          {/* 7. Third-Party Links */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.thirdPartyLinks.title')}
            </h2>
            <p>{t('termsOfService.sections.thirdPartyLinks.content')}</p>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.intellectualProperty.title')}
            </h2>
            <p>{t('termsOfService.sections.intellectualProperty.content')}</p>
          </section>

          {/* 9. Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.disclaimer.title')}
            </h2>
            <p>{t('termsOfService.sections.disclaimer.content')}</p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.limitation.title')}
            </h2>
            <p>{t('termsOfService.sections.limitation.content')}</p>
          </section>

          {/* 11. Termination */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.termination.title')}
            </h2>
            <p>{t('termsOfService.sections.termination.content')}</p>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.changes.title')}
            </h2>
            <p>{t('termsOfService.sections.changes.content')}</p>
          </section>

          {/* 13. Governing Law */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.governingLaw.title')}
            </h2>
            <p>{t('termsOfService.sections.governingLaw.content')}</p>
          </section>

          {/* 14. Contact */}
          <section>
            <h2 className="text-2xl text-gray-900 mb-4">
              {t('termsOfService.sections.contact.title')}
            </h2>
            <p>{t('termsOfService.sections.contact.content')}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
