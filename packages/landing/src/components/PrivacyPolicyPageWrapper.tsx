import { I18nProvider } from './I18nProvider';
import { Header } from './Header';
import { Footer } from './Footer';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';

interface PrivacyPolicyPageWrapperProps {
  loginUrl: string;
}

export function PrivacyPolicyPageWrapper({ loginUrl }: PrivacyPolicyPageWrapperProps) {
  return (
    <I18nProvider>
      <div className="w-full">
        <Header loginUrl={loginUrl} navLinks={[]} variant="solid" />
        <PrivacyPolicyPage />
        <Footer />
      </div>
    </I18nProvider>
  );
}
