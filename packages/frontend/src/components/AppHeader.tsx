import type { ReactNode } from 'react';

import { Sparkles } from './icons';
import { ThemeToggle } from './theme-toggle';

interface AppHeaderProps {
  actions?: ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold md:text-2xl">My Wishlist</h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

