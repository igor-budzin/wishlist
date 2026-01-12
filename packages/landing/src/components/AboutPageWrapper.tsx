import { I18nProvider } from './I18nProvider';
import { Header } from './Header';
import { Footer } from './Footer';
import { AboutPage } from './AboutPage';

interface AboutPageWrapperProps {
  loginUrl: string;
}

export function AboutPageWrapper({ loginUrl }: AboutPageWrapperProps) {
  return (
    <I18nProvider>
      <div className="w-full">
        <Header loginUrl={loginUrl} navLinks={[]} variant="solid" />
        <AboutPage />
        <Footer />
      </div>
    </I18nProvider>
  );
}
