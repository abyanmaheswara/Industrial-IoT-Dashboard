import React from 'react';


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
    <div className="card p-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-white`}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${isPositive ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
          )}
        </div>
        
        <h3 className="text-industrial-600 dark:text-industrial-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <div className="flex items-baseline mt-1">
          <span className="text-2xl font-bold text-industrial-900 dark:text-white tracking-tight">{value}</span>
          {unit && <span className="ml-1 text-industrial-500 dark:text-industrial-500 text-sm font-medium">{unit}</span>}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${color} opacity-5 blur-xl`}></div>
    </div>
  );
};
