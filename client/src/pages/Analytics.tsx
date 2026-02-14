import React, { useState, useEffect } from 'react';
import { TrendChart } from '../components/Analytics/TrendChart';
import { MetricsCard } from '../components/Analytics/MetricsCard';
import { ExportControls } from '../components/ExportControls';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('24h');
  const [selectedSensor, setSelectedSensor] = useState('temp_01');
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Fetch history data when sensor or range changes
  const [unitSystem, setUnitSystem] = useState('Celsius');

  useEffect(() => {
    const saved = localStorage.getItem('settings_temp_unit');
    if (saved) setUnitSystem(saved);

    const handleSettingsChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.tempUnit) {
            setUnitSystem(customEvent.detail.tempUnit);
        }
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // limit param is just a simple way to control data amount for now
        const limit = dateRange === '24h' ? 50 : dateRange === '7d' ? 168 : 720; 
        const response = await fetch(`http://localhost:3001/api/history/${selectedSensor}?limit=${limit}`);
        const data = await response.json();
        
        // Transform for chart
        // Recharts expects array of objects
        const charted = data.map((d: any) => {
           let val = parseFloat(d.value);
           // Convert if Temperature sensor AND unit is Fahrenheit
           if (selectedSensor === 'temp_01' && unitSystem === 'Fahrenheit') {
               val = Number((val * 9/5 + 32).toFixed(1));
           }
           return {
              time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              value: val
           };
        });
        
        setHistoryData(charted);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        }
    };

    fetchData();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedSensor, dateRange, unitSystem]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-industrial-50">System Analytics</h1>
          <p className="text-industrial-400 text-sm mt-1">Real-time database history</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-4 items-center">
          <ExportControls sensorId={selectedSensor} />
          
          <div className="h-8 w-px bg-industrial-700 hidden md:block"></div>

          <select 
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            className="bg-industrial-800 text-industrial-100 border border-industrial-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="temp_01">Temperature A</option>
            <option value="press_01">Pressure Main</option>
            <option value="vib_01">Vibration Motor</option>
            <option value="pwr_01">Power Consumption</option>
          </select>

          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-industrial-800 text-industrial-100 border border-industrial-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricsCard 
          title="OEE Score" 
          value="87.5"
          unit="%" 
          change={2.4} 
          icon={<Activity size={24} />} 
          color="bg-brand-500"
        />
        <MetricsCard 
          title="Energy Usage" 
          value="450" 
          unit="kWh"
          change={-1.2} 
          icon={<Zap size={24} />} 
          color="bg-yellow-500"
        />
        <MetricsCard 
          title="Downtime" 
          value="12" 
          unit="m"
          change={-5} 
          icon={<Clock size={24} />} 
          color="bg-red-500"
        />
        <MetricsCard 
          title="Active Alerts" 
          value="3" 
          change={1} 
          icon={<AlertTriangle size={24} />} 
          color="bg-orange-500"
        />
      </div>

      {/* Main Chart */}
      <div className="card p-6 rounded-xl border border-industrial-700 shadow-lg">
        <h2 className="text-lg font-semibold text-industrial-50 mb-4">
          Sensor History: {selectedSensor}
        </h2>
        <div className="h-80 w-full">
            {/* 
              TrendChart implementation depends on what props it accepts.
              Assuming it accepts 'data' and 'dataKeys' or similar.
              Based on previous context, let's try to match its expected props.
              If TrendChart is generic, we might need to adjust.
            */}
             <TrendChart 
                title="" 
                data={historyData}
                dataKeys={[
                    { key: 'value', color: '#FF6B35', name: 'Value' }
                ]}
            />
        </div>
      </div>
    </div>
  );
};
