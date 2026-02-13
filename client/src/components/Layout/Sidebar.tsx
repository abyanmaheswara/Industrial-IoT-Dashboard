import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, AlertTriangle, Settings, X, Cpu } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Analytics', icon: <Activity size={20} />, path: '/analytics' },
    { name: 'Alerts', icon: <AlertTriangle size={20} />, path: '/alerts' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-20 w-64 bg-industrial-900 border-r border-industrial-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-industrial-800">
        <div className="flex items-center text-blue-500">
          <Cpu className="mr-2" />
          <span className="font-bold text-lg tracking-wider text-white">INDUS<span className="text-blue-500">IOT</span></span>
        </div>
        <button 
          className="md:hidden text-industrial-400 hover:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600/10 text-blue-500 border-l-2 border-blue-500' 
                : 'text-industrial-400 hover:bg-industrial-800 hover:text-white border-l-2 border-transparent'}
            `}
          >
            <span className="mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-industrial-800">
        <div className="bg-industrial-800/50 rounded-lg p-3">
          <p className="text-xs text-industrial-400 uppercase font-bold mb-2">System Status</p>
          <div className="flex justify-between items-center text-xs text-white mb-1">
            <span>CPU Load</span>
            <span className="text-green-400">24%</span>
          </div>
          <div className="w-full bg-industrial-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[24%]"></div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-white mt-2 mb-1">
            <span>Memory</span>
            <span className="text-blue-400">58%</span>
          </div>
          <div className="w-full bg-industrial-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[58%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
