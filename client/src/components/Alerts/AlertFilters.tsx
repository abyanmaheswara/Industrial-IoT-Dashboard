import React from 'react';
import { Search, Filter, AlertTriangle } from 'lucide-react';

interface AlertFiltersProps {
  filterType: string;
  setFilterType: (type: string) => void;
  showCriticalOnly: boolean;
  setShowCriticalOnly: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({ 
  filterType, 
  setFilterType, 
  showCriticalOnly, 
  setShowCriticalOnly,
  searchQuery,
  setSearchQuery
}) => {
    return (
        <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-industrial-500" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by sensor or ID..." 
                    className="w-full pl-10 pr-4 py-2 bg-industrial-950/50 border border-brand-500/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-brand-500/50 placeholder-brand-900/30 transition-all"
                />
            </div>
            
            <div className="flex w-full md:w-auto space-x-2 overflow-x-auto pb-2 md:pb-0">
                 <button 
                    onClick={() => setFilterType(filterType === 'all' ? 'warning' : 'all')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors whitespace-nowrap ${
                        filterType === 'warning' 
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-[0_0_15px_rgba(168,121,50,0.15)]' 
                            : 'bg-black/20 border-brand-500/10 text-brand-700 hover:text-brand-400 hover:bg-brand-500/5'
                    }`}
                >
                    <Filter size={16} />
                    <span className="text-sm font-bold tracking-tight">Warnings</span>
                </button>
                
                 <button 
                    onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                    className={`px-3 py-2 border rounded text-sm font-bold whitespace-nowrap transition-colors flex items-center ${
                        showCriticalOnly 
                            ? 'bg-red-950/30 border-red-500 text-red-500 ring-1 ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                            : 'bg-industrial-800 border-industrial-700 text-industrial-400 hover:bg-red-900/10 hover:text-red-500'
                    }`}
                >
                    <AlertTriangle size={16} className="mr-2" />
                    Critical Only
                </button>
            </div>
        </div>
    )
}
