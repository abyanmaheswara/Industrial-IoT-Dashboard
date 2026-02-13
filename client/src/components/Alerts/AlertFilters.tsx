import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

export const AlertFilters: React.FC = () => {
    return (
        <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-industrial-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search alerts by sensor name or ID..." 
                    className="w-full pl-10 pr-4 py-2 bg-industrial-950 border border-industrial-800 rounded-md text-white focus:outline-none focus:border-blue-500 placeholder-industrial-600"
                />
            </div>
            
            <div className="flex w-full md:w-auto space-x-2 overflow-x-auto pb-2 md:pb-0">
                 <button className="flex items-center space-x-2 px-3 py-2 bg-industrial-800 text-industrial-300 hover:text-white rounded border border-industrial-700 transition-colors whitespace-nowrap">
                    <Filter size={16} />
                    <span className="text-sm">Filter Status</span>
                </button>
                 <button className="flex items-center space-x-2 px-3 py-2 bg-industrial-800 text-industrial-300 hover:text-white rounded border border-industrial-700 transition-colors whitespace-nowrap">
                    <Calendar size={16} />
                    <span className="text-sm">Date Range</span>
                </button>
                 <button className="px-3 py-2 bg-industrial-900 border border-alert-critical text-alert-critical hover:bg-red-900/20 rounded text-sm whitespace-nowrap transition-colors">
                    Critical Only
                </button>
            </div>
        </div>
    )
}
