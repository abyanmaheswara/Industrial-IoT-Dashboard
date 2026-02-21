import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SupportBot } from "../SupportBot";

const MainLayout: React.FC<{ children?: React.ReactNode; mqttStatus?: { connected: boolean; clients: number } }> = ({ children, mqttStatus }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-industrial-950 overflow-hidden font-sans relative">
      <Sidebar mqttStatus={mqttStatus} isMobileOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Mobile Backdrop */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header mqttStatus={mqttStatus} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 industrial-grid-premium opacity-10 pointer-events-none" />
          {children || <Outlet />}
        </main>
      </div>

      <SupportBot />
    </div>
  );
};

export default MainLayout;
