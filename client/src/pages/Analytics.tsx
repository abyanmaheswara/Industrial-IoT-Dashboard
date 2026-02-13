import React, { useState } from 'react';
import { Activity, Zap, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { MetricsCard } from '../components/Analytics/MetricsCard';
import { TrendChart } from '../components/Analytics/TrendChart';

// Mock Data Generators
const generateHourlyData = (hours: number) => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
    // Simulate sinusoidal temperature + noise
    const temp = 45 + 10 * Math.sin(i / 4) + Math.random() * 5;
    // Simulate power usage (higher during day)
    const hour = time.getHours();
    const isWorkingHours = hour >= 8 && hour <= 18;
    const power = isWorkingHours ? (70 + Math.random() * 20) : (30 + Math.random() * 10);
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: parseFloat(temp.toFixed(1)),
      power: parseFloat(power.toFixed(1)),
      vibration: parseFloat((2 + Math.random() * 3).toFixed(1))
    });
  }
  return data;
};

export const Analytics: React.FC = () => {
  const [data] = useState(generateHourlyData(24));
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">System Analytics</h1>
          <p className="text-industrial-400 text-sm mt-1">Overview of system performance and historical trends</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-industrial-800 text-industrial-300 hover:text-white rounded border border-industrial-700 transition-colors">
                <Calendar size={16} />
                <span className="text-sm">Last 24 Hours</span>
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium">
                Export Report
            </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard 
            title="OEE Score" 
            value="87.5" 
            unit="%" 
            change={2.4} 
            icon={<Activity size={24} />} 
            color="bg-purple-500"
        />
        <MetricsCard 
            title="Energy (24h)" 
            value="1,245" 
            unit="kWh" 
            change={-5.2} 
            icon={<Zap size={24} />} 
            color="bg-amber-500"
        />
        <MetricsCard 
            title="Downtime" 
            value="12" 
            unit="min" 
            change={-15} 
            icon={<Clock size={24} />} 
            color="bg-blue-500"
        />
         <MetricsCard 
            title="Alerts (24h)" 
            value="3" 
            change={50} 
            icon={<AlertTriangle size={24} />} 
            color="bg-red-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart 
            title="Power Consumption Vs Temperature" 
            data={data}
            dataKeys={[
                { key: 'power', color: '#f59e0b', name: 'Power (kW)' },
                { key: 'temperature', color: '#10b981', name: 'Temp (°C)' }
            ]}
        />
         <TrendChart 
            title="Motor Vibration Analysis" 
            data={data}
            dataKeys={[
                { key: 'vibration', color: '#3b82f6', name: 'Vibration (mm/s)' }
            ]}
        />
      </div>
    </div>
  );
};
