import type { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  loginUrl: string;
  showNav?: boolean;
}

export function PageWrapper({ children, loginUrl, showNav = false }: PageWrapperProps) {
  return (
    <I18nProvider>
      <div className="w-full">
        <Header loginUrl={loginUrl} navLinks={showNav ? undefined : []} variant="solid" />
        {children}
        <Footer />
      </div>
    </I18nProvider>
  );
}
