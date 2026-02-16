import { NavLink } from 'react-router-dom';
import LogoWithText from '../LogoWithText';
import { LayoutDashboard, BarChart2, Bell, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-brand-950/90 backdrop-blur-2xl border-r border-brand-500/30 flex flex-col relative z-20 transition-all duration-500 group">
      {/* Subtle scanline effect for sidebar */}
      <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none" />
      
      {/* Logo Container */}
      <div className="p-6 border-b border-brand-500/10 relative">
        <LogoWithText size="md" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3 mt-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/nav relative overflow-hidden ${
              isActive
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_rgba(180,83,9,0.1)]'
                : 'text-brand-700/70 hover:text-brand-400 hover:bg-brand-500/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-brand-500 shadow-[0_0_10px_#f59e0b]" />
              )}
              <LayoutDashboard size={18} className={`${isActive ? 'text-brand-500' : 'text-brand-700/50 group-hover/nav:text-brand-400'} transition-colors`} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/nav relative overflow-hidden ${
              isActive
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                : 'text-industrial-500 hover:text-white hover:bg-white/[0.03]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-brand-500 shadow-[0_0_10px_#f59e0b]" />
              )}
              <BarChart2 size={18} className={`${isActive ? 'text-brand-500' : 'text-brand-700/50 group-hover/nav:text-brand-400'} transition-colors`} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Analytics</span>
            </>
          )}
        </NavLink>

        <NavLink
            to="/alerts"
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/nav relative overflow-hidden ${
                isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                    : 'text-industrial-500 hover:text-white hover:bg-white/[0.03]'
                }`
            }
            >
            {({ isActive }) => (
                <>
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-brand-500 shadow-[0_0_10px_#f59e0b]" />
                )}
                <Bell size={18} className={`${isActive ? 'text-brand-500' : 'text-brand-700/50 group-hover/nav:text-brand-400'} transition-colors`} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Alerts</span>
                </>
            )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group/nav relative overflow-hidden ${
              isActive
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                : 'text-industrial-500 hover:text-white hover:bg-white/[0.03]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 bg-brand-500 shadow-[0_0_10px_#f59e0b]" />
              )}
              <Settings size={18} className={`${isActive ? 'text-brand-500' : 'text-brand-700/50 group-hover/nav:text-brand-400'} transition-colors`} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Settings</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* System Health Check (Mechanical feel) */}
      <div className="p-4 bg-industrial-950/40 border-t border-brand-500/10 m-3 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rotate-45 -mr-8 -mt-8 pointer-events-none" />
        
        <div className="text-[9px] font-black text-brand-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_5px_#a87932]" />
          Infrastructure
        </div>
        
        <div className="space-y-4">
          <div className="group/meter">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[9px] font-bold text-industrial-600 uppercase tracking-widest group-hover/meter:text-industrial-400 transition-colors">CPU CORE_X1</span>
              <span className="text-[9px] font-mono font-bold text-green-500">24%</span>
            </div>
            <div className="w-full bg-industrial-950/60 rounded-full h-1 border border-brand-900/10 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: '24%' }}></div>
            </div>
          </div>
          
          <div className="group/meter">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[9px] font-bold text-industrial-600 uppercase tracking-widest group-hover/meter:text-industrial-400 transition-colors">PHYS_MEM_01</span>
              <span className="text-[9px] font-mono font-bold text-brand-500">58%</span>
            </div>
            <div className="w-full bg-industrial-950/60 rounded-full h-1 border border-brand-500/10 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(168,121,50,0.3)]" style={{ width: '58%' }}></div>
            </div>
          </div>
        </div>
        
        {/* Footer info in sidebar */}
        <div className="mt-6 flex items-center justify-between opacity-30">
            <span className="text-[8px] font-mono">SYS_AUTH:OK</span>
            <span className="text-[8px] font-mono">03:45:12</span>
        </div>
      </div>
    </aside>
  );
}
