import { I18nProvider } from './I18nProvider';
import { Header } from './Header';
import { Footer } from './Footer';
import { TermsOfServicePage } from './TermsOfServicePage';

interface TermsOfServicePageWrapperProps {
  loginUrl: string;
}

export function TermsOfServicePageWrapper({ loginUrl }: TermsOfServicePageWrapperProps) {
  return (
    <I18nProvider>
      <div className="w-full">
        <Header loginUrl={loginUrl} navLinks={[]} variant="solid" />
        <TermsOfServicePage />
        <Footer />
      </div>
    </I18nProvider>
  );
}
