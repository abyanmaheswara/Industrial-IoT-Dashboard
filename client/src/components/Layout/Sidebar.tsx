import { NavLink } from 'react-router-dom';
import LogoWithText from '../LogoWithText';
import { LayoutDashboard, BarChart2, Bell, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 bg-industrial-50 dark:bg-industrial-900 border-r border-industrial-200 dark:border-industrial-800 flex flex-col transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b border-industrial-200 dark:border-industrial-800">
        <LogoWithText size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-brand-brown to-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-industrial-600 dark:text-industrial-400 hover:bg-industrial-100 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Overview</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-brand-brown to-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-industrial-600 dark:text-industrial-400 hover:bg-industrial-100 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
            }`
          }
        >
          <BarChart2 size={20} />
          <span className="font-medium">Analytics</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-brand-brown to-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-industrial-600 dark:text-industrial-400 hover:bg-industrial-100 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
            }`
          }
        >
          <Bell size={20} />
          <span className="font-medium">Alerts</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-brand-brown to-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-industrial-600 dark:text-industrial-400 hover:bg-industrial-100 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
            }`
          }
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>
      </nav>



      {/* System Status */}
      <div className="p-4 bg-industrial-50 dark:bg-industrial-900 border-t border-industrial-200 dark:border-industrial-800">
        <p className="text-xs font-medium text-industrial-600 dark:text-industrial-400 mb-2">
          SYSTEM STATUS
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-industrial-600 dark:text-industrial-400">CPU Load</span>
            <span className="text-xs font-bold text-green-500">24%</span>
          </div>
          <div className="w-full bg-industrial-200 dark:bg-industrial-700 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-industrial-600 dark:text-industrial-400">Memory</span>
            <span className="text-xs font-bold text-brand-500">58%</span>
          </div>
          <div className="w-full bg-industrial-200 dark:bg-industrial-700 rounded-full h-1.5">
            <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
