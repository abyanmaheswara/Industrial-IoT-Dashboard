import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children?: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-industrial-950 text-white font-sans selection:bg-brand-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto bg-industrial-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#705020_0%,_transparent_50%)] opacity-10 pointer-events-none" />
          <div className="relative z-10 h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
