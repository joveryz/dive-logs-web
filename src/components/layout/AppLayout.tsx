import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 overflow-hidden" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
