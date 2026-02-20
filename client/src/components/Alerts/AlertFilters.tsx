import React from "react";
import { Search, Filter, AlertTriangle } from "lucide-react";

interface AlertFiltersProps {
  filterType: string;
  setFilterType: (type: string) => void;
  showCriticalOnly: boolean;
  setShowCriticalOnly: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({ filterType, setFilterType, showCriticalOnly, setShowCriticalOnly, searchQuery, setSearchQuery }) => {
  return (
    <div className="card-premium p-5 flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.01]">
      <div className="relative w-full md:w-full max-w-md group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-industrial-600 group-focus-within:text-brand-main transition-colors" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Incident Log [Sensor_ID / Node_Name]..."
          className="w-full pl-12 pr-4 py-3 bg-industrial-950 border border-white/5 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 placeholder-industrial-700 transition-all shadow-inner uppercase tracking-wider"
        />
      </div>

      <div className="flex w-full md:w-auto items-center gap-3">
        <button
          onClick={() => setFilterType(filterType === "all" ? "warning" : "all")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-300 whitespace-nowrap ${
            filterType === "warning" ? "bg-brand-main/20 border-brand-main/40 text-brand-light shadow-lg" : "bg-industrial-950 border-white/5 text-industrial-500 hover:text-white hover:bg-white/5 hover:border-white/10"
          }`}
        >
          <Filter size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Warnings</span>
        </button>

        <button
          onClick={() => setShowCriticalOnly(!showCriticalOnly)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-300 whitespace-nowrap ${
            showCriticalOnly ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "bg-industrial-950 border-white/5 text-industrial-500 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20"
          }`}
        >
          <AlertTriangle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Critical Only</span>
        </button>
      </div>
    </div>
  );
};
