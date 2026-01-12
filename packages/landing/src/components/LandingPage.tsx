import { I18nProvider } from './I18nProvider';
import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Features } from './Features';
import { SeeInAction } from './SeeInAction';
import { Faq } from './Faq';
import { CTA } from './CTA';
import { Footer } from './Footer';

interface LandingPageProps {
  loginUrl: string;
}

export function LandingPage({ loginUrl }: LandingPageProps) {
  return (
    <I18nProvider>
      <div className="w-full">
        <Header loginUrl={loginUrl} />
        <Hero loginUrl={loginUrl} />
        <HowItWorks />
        <Features />
        <SeeInAction />
        <Faq />
        <CTA loginUrl={loginUrl} />
        <Footer />
      </div>
    </I18nProvider>
  );
}
