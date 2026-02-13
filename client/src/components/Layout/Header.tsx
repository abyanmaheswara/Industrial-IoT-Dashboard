import React from 'react';
import { Bell, Menu, Settings } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  socketConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, socketConnected }) => {
  return (
    <header className="bg-industrial-900 border-b border-industrial-800 h-16 flex items-center justify-between px-6 z-10 shadow-md">
      <button 
        className="text-industrial-400 hover:text-white md:hidden focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center ml-auto space-x-4">
        <div className="flex items-center px-3 py-1 bg-industrial-800 rounded-full border border-industrial-700">
          <div className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${socketConnected ? 'text-green-400' : 'text-red-400'}`}>
            {socketConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        <button className="p-2 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="p-2 text-industrial-400 hover:text-white hover:bg-industrial-800 rounded-full transition-colors">
          <Settings size={20} />
        </button>
        
        <div className="flex items-center pl-4 border-l border-industrial-800">
          <div className="w-8 h-8 rounded-full bg-industrial-700 flex items-center justify-center text-xs font-bold text-white border border-industrial-600">
            OP
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium text-white">Operator 01</p>
            <p className="text-xs text-industrial-400">Control Room A</p>
          </div>
        </div>
      </div>
    </header>
  );
};
