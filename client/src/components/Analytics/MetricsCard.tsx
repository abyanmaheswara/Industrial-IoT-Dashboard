import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number; // percentage change
  icon: React.ReactNode;
  color?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, unit, change, icon, color = 'bg-brand-500' }) => {
  const isPositive = change && change > 0;
  
  return (
    <div className="relative group overflow-hidden bg-industrial-950/40 backdrop-blur-xl p-5 rounded-xl border border-brand-500/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-brand-500/30">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-500/20 rounded-tl group-hover:border-brand-500/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-500/20 rounded-br group-hover:border-brand-500/50 transition-colors" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-lg ${color} bg-opacity-10 border border-white/5 text-white shadow-inner flex items-center justify-center w-10 h-10`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border ${isPositive ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <h3 className="text-industrial-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <div className="flex items-baseline mt-1 gap-1">
          <span className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(168,121,50,0.2)]">{value}</span>
          {unit && <span className="text-brand-500 text-xs font-black uppercase tracking-widest">{unit}</span>}
        </div>
      </div>
      
      {/* Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
