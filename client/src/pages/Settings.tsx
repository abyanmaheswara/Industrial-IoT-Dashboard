import React from "react";
import { Settings as SettingsIcon, Cpu, User, Bell, Sliders } from "lucide-react";
import { ProfileSection } from "../components/Settings/ProfileSection";
import { SystemConfigSection } from "../components/Settings/SystemConfigSection";
import { NotificationsSection } from "../components/Settings/NotificationsSection";
import SensorManager from "../components/SensorManager";

export const Settings: React.FC = () => {
  return (
    <div className="px-10 py-10 h-full overflow-y-auto custom-scrollbar relative">
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex flex-col">
          <h1 className="text-[12px] font-black text-white tracking-[0.4em] uppercase flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-brand-main" />
            System Control Center
          </h1>
          <p className="text-[9px] text-industrial-600 font-mono mt-2 uppercase tracking-widest italic">Global_Configuration // Central_Command_Node</p>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        {/* User Profile Section */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-brand-main/10 rounded-lg border border-brand-main/20 text-brand-main shadow-inner">
              <User size={18} />
            </div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Personnel Credentials</h2>
          </div>
          <ProfileSection />
        </section>

        {/* Sensor Management Section */}
        <section className="animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-brand-main/10 rounded-lg border border-brand-main/20 text-brand-main shadow-inner">
              <Cpu size={18} />
            </div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Hardware Matrix Interface</h2>
          </div>
          <SensorManager />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* System Configuration */}
          <section className="animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-brand-main/10 rounded-lg border border-brand-main/20 text-brand-main shadow-inner">
                <Sliders size={18} />
              </div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Operational Parameters</h2>
            </div>
            <SystemConfigSection />
          </section>

          {/* Notifications */}
          <section className="animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-brand-main/10 rounded-lg border border-brand-main/20 text-brand-main shadow-inner">
                <Bell size={18} />
              </div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Emergency Broadcast Protocol</h2>
            </div>
            <NotificationsSection />
          </section>
        </div>
      </div>
    </div>
  );
};
