import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

interface MainLayoutProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  socketConnected: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ sidebarOpen, setSidebarOpen, socketConnected }) => {
  return (
    <div className="flex h-screen bg-industrial-950 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} socketConnected={socketConnected} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-industrial-950 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
