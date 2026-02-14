import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children?: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  // Theme is now handled by ThemeContext directly on document.documentElement
  // No need to apply it here anymore
  
  return (
    <div className="flex h-screen bg-industrial-50 dark:bg-industrial-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-industrial-50 dark:bg-industrial-950">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
