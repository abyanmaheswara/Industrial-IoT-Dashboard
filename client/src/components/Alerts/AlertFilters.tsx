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
                    placeholder="Search alerts by sensor name or ID..." 
                    className="w-full pl-10 pr-4 py-2 bg-industrial-50 dark:bg-industrial-950 border border-industrial-300 dark:border-industrial-800 rounded-md text-industrial-900 dark:text-white focus:outline-none focus:border-brand-500 placeholder-industrial-400 dark:placeholder-industrial-600"
                />
            </div>
            
            <div className="flex w-full md:w-auto space-x-2 overflow-x-auto pb-2 md:pb-0">
                 <button 
                    onClick={() => setFilterType(filterType === 'all' ? 'warning' : 'all')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors whitespace-nowrap ${
                        filterType === 'warning' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-500' 
                            : 'bg-industrial-100 dark:bg-industrial-800 border-industrial-300 dark:border-industrial-700 text-industrial-700 dark:text-industrial-300 hover:text-industrial-900 dark:hover:text-white'
                    }`}
                >
                    <Filter size={16} />
                    <span className="text-sm">Warnings</span>
                </button>
                
                 <button 
                    onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                    className={`px-3 py-2 border rounded text-sm whitespace-nowrap transition-colors flex items-center ${
                        showCriticalOnly 
                            ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-500' 
                            : 'bg-industrial-100 dark:bg-industrial-900 border-industrial-300 dark:border-industrial-700 text-industrial-700 dark:text-industrial-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                >
                    <AlertTriangle size={16} className="mr-2" />
                    Critical Only
                </button>
            </div>
        </div>
    )
}
