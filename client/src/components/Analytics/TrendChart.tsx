import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  data: any[];
  title: string;
  dataKeys: { key: string; color: string; name: string }[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title, dataKeys }) => {
  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-industrial-900 dark:text-white">{title}</h3>
        {/* Placeholder for controls */}
        <div className="flex space-x-2">
            <select className="bg-industrial-100 dark:bg-industrial-700 border border-industrial-300 dark:border-industrial-600 text-xs text-industrial-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:border-brand-500">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {dataKeys.map((k) => (
                <linearGradient key={k.key} id={`color${k.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={k.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={k.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a343c" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#688397"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
               stroke="#688397"
               tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#151a1e', borderColor: '#2a343c', color: '#f4f6f8' }}
              labelStyle={{ color: '#879cac' }}
            />
            <Legend />
            {dataKeys.map((k) => (
              <Area 
                key={k.key}
                type="monotone" 
                dataKey={k.key} 
                name={k.name}
                stroke={k.color} 
                fillOpacity={1} 
                fill={`url(#color${k.key})`} 
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
