import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const MainLayout: React.FC<{ children?: React.ReactNode; mqttStatus?: { connected: boolean; clients: number } }> = ({ children, mqttStatus }) => {
  return (
    <div className="flex h-screen bg-industrial-950 overflow-hidden font-sans">
      <Sidebar mqttStatus={mqttStatus} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header mqttStatus={mqttStatus} />
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 industrial-grid-premium opacity-10 pointer-events-none" />
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
