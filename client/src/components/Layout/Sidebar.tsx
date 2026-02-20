import { NavLink } from "react-router-dom";
import LogoWithText from "../LogoWithText";
import { LayoutDashboard, BarChart2, Bell, Settings } from "lucide-react";

export function Sidebar({ mqttStatus }: { mqttStatus?: { connected: boolean; clients: number } }) {
  return (
    <aside className="w-64 bg-industrial-900 border-r border-industrial-700/50 flex flex-col relative z-20 transition-all duration-500 group">
      <div className="scanline-premium opacity-[0.03]" />

      {/* Logo Container */}
      <div className="p-8 relative">
        <LogoWithText size="md" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-main/20 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2 mt-4">
        {[
          { to: "/", icon: LayoutDashboard, label: "Systems Overview" },
          { to: "/analytics", icon: BarChart2, label: "Deep Intel" },
          { to: "/alerts", icon: Bell, label: "Signal Log" },
          { to: "/settings", icon: Settings, label: "Sys Config" },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group/nav relative overflow-hidden ${
                isActive ? "bg-brand-main/10 text-brand-light border border-brand-main/30 shadow-[0_0_20px_rgba(180,83,9,0.1)]" : "text-industrial-400 hover:text-white hover:bg-white/[0.02]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-brand-main shadow-[0_0_15px_#b45309]" />}
                <item.icon size={18} className={`${isActive ? "text-brand-main" : "text-industrial-500 group-hover/nav:text-brand-light"} transition-colors`} />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Infrastructure Node (Premium Card) */}
      <div className="p-5 mx-4 mb-8 bg-industrial-950/60 border border-brand-main/10 rounded-2xl relative overflow-hidden group/card shadow-inner">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-main/5 rotate-45 -mr-12 -mt-12 pointer-events-none transition-transform group-hover/card:scale-110" />

        <div className="text-[9px] font-black text-brand-main uppercase tracking-[0.35em] mb-5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-main animate-pulse shadow-[0_0_10px_#b45309]" />
          Infrastructure
        </div>

        <div className="mb-6 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black text-industrial-500 uppercase tracking-widest">Signal Protocol</span>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${mqttStatus?.connected ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"} uppercase tracking-widest`}>
              {mqttStatus?.connected ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/50">
            <div className={`w-1 h-1 rounded-full ${mqttStatus?.connected ? "bg-emerald-500" : "bg-industrial-700"}`} />
            Nodes Linked: {mqttStatus?.clients || 0}
          </div>
        </div>

        <div className="space-y-5">
          {[
            { label: "CPU NODE_01", val: 24, color: "from-green-600 to-emerald-400" },
            { label: "CORE_MEM_V4", val: 58, color: "from-brand-main to-brand-light" },
          ].map((meter) => (
            <div key={meter.label} className="group/meter">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-industrial-500 uppercase tracking-widest">{meter.label}</span>
                <span className="text-[9px] font-mono font-bold text-white/70">{meter.val}%</span>
              </div>
              <div className="w-full bg-industrial-900 rounded-full h-1 border border-white/5 overflow-hidden">
                <div className={`bg-gradient-to-r ${meter.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${meter.val}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between opacity-30 border-t border-white/5 pt-4">
          <span className="text-[8px] font-mono font-bold">UPLINK_STABLE</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-brand-main rounded-full" />
            <div className="w-1 h-1 bg-brand-main rounded-full" />
            <div className="w-1 h-1 bg-brand-main rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
