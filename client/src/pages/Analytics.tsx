import React, { useState, useEffect, useMemo } from 'react';
import { MetricsCard } from '../components/Analytics/MetricsCard';
import { ExportControls } from '../components/ExportControls';
import { IndustrialDropdown } from '../components/IndustrialDropdown';
import { 
  Activity,
  Zap, 
  Clock, 
  AlertTriangle, 
  Download,
  Database,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from '../socket';

interface DataPoint {
  timestamp: number | string;
  time: string;
  value: number;
}

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('24h');
  const [selectedSensor, setSelectedSensor] = useState('temp_01');
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [unitSystem, setUnitSystem] = useState('Celsius');
  const [isLoading, setIsLoading] = useState(false);

  const sensorOptions = [
    { value: 'temp_01', label: 'Therm_Unit_01' },
    { value: 'press_01', label: 'Pressure_V12' },
    { value: 'vib_01', label: 'Mot_Vibration' },
    { value: 'pwr_01', label: 'Grid_Power_Load' },
  ];

  const dateOptions = [
    { value: '24h', label: 'Cycle_24H' },
    { value: '7d', label: 'Cycle_07D' },
    { value: '30d', label: 'Cycle_30D' },
  ];

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const limit = dateRange === '24h' ? 50 : dateRange === '7d' ? 168 : 720; 
      const response = await fetch(`${API_URL}/api/history/${selectedSensor}?limit=${limit}`);
      const data = await response.json();
      
      const charted = data.map((d: any) => {
        let val = parseFloat(d.value);
        if (selectedSensor === 'temp_01' && unitSystem === 'Fahrenheit') {
          val = Number((val * 9/5 + 32).toFixed(1));
        }
        return {
          timestamp: d.timestamp,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: val
        };
      });
      
      setHistoryData(charted.reverse()); 
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (!socket.connected) socket.connect();

    const handleRealTimeUpdate = (data: any[]) => {
      const sensorUpdate = data.find(s => s.id === selectedSensor);
      if (sensorUpdate) {
        let val = parseFloat(sensorUpdate.value);
        if (selectedSensor === 'temp_01' && unitSystem === 'Fahrenheit') {
          val = Number((val * 9/5 + 32).toFixed(1));
        }

        const newDataPoint: DataPoint = {
          timestamp: sensorUpdate.timestamp,
          time: new Date(sensorUpdate.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: val
        };

        setHistoryData((prev: DataPoint[]) => {
          if (prev.length > 0 && prev[prev.length - 1].timestamp === newDataPoint.timestamp) return prev;
          
          const limit = dateRange === '24h' ? 50 : dateRange === '7d' ? 168 : 720;
          const updated = [...prev, newDataPoint];
          return updated.length > limit ? updated.slice(updated.length - limit) : updated;
        });
      }
    };

    socket.on('sensorData', handleRealTimeUpdate);

    return () => {
      socket.off('sensorData', handleRealTimeUpdate);
    };
  }, [selectedSensor, dateRange, unitSystem]);

  const stats = useMemo(() => {
    const values = historyData.map(d => d.value);
    if (values.length === 0) return { avg: "0.00", max: "0.00", min: "0.00" };
    
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    
    return { avg, max, min };
  }, [historyData]);

  return (
    <div className="px-6 py-6 overflow-y-auto h-full space-y-6 custom-scrollbar relative">
      <div className="industrial-grid absolute inset-0 opacity-5 pointer-events-none" />

      {/* Header Intelligence */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500 shadow-[0_0_20px_rgba(168,121,50,0.1)]">
              <BarChart3 size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Deep Intelligence</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                 <p className="text-[10px] text-industrial-500 font-mono tracking-widest uppercase italic">Operational Telemetry Hub</p>
              </div>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Custom Dropdowns */}
          <IndustrialDropdown 
            options={sensorOptions}
            value={selectedSensor}
            onChange={setSelectedSensor}
            icon={<Database size={14} />}
            labelPrefix="Node"
          />

          <IndustrialDropdown 
            options={dateOptions}
            value={dateRange}
            onChange={setDateRange}
            icon={<Clock size={14} />}
            labelPrefix="Window"
          />

          <button 
             onClick={fetchData}
             className={`p-2.5 bg-industrial-950/40 border border-brand-500/10 rounded-lg text-industrial-400 hover:text-brand-500 hover:border-brand-500/30 transition-all ${isLoading ? 'animate-spin' : ''}`}
          >
             <RefreshCw size={14} />
          </button>

          <div className="hidden sm:block h-6 w-px bg-industrial-800 mx-2" />
          
          <ExportControls sensorId={selectedSensor} />
        </div>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-6 duration-1000">
        <MetricsCard 
          title="Avg Efficiency" 
          value={stats.avg}
          unit="%" 
          change={1.8} 
          icon={<Activity size={20} />} 
          color="bg-green-500"
        />
        <MetricsCard 
          title="Peak Resource" 
          value={stats.max} 
          unit="pt"
          change={4.2} 
          icon={<Zap size={20} />} 
          color="bg-brand-500"
        />
        <MetricsCard 
          title="Stall Count" 
          value="02" 
          unit="evt"
          change={-15} 
          icon={<Clock size={20} />} 
          color="bg-blue-500"
        />
        <MetricsCard 
          title="Risk Index" 
          value="Low" 
          change={-5} 
          icon={<AlertTriangle size={20} />} 
          color="bg-red-500"
        />
      </div>

      {/* Deep Intelligence Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
         <div className="lg:col-span-9 bg-industrial-950/40 backdrop-blur-xl rounded-xl border border-brand-500/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden group min-h-[500px]">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-500/30 rounded-tl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-500/30 rounded-br" />
            
            <div className="p-8">
               <div className="flex justify-between items-center mb-10">
                  <div className="flex flex-col">
                     <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-brand-500" />
                        Vector Trend Mapping
                     </h2>
                     <span className="text-[9px] text-industrial-600 font-mono mt-1 tracking-widest uppercase">Node_Link: {selectedSensor.toUpperCase()} // RESOLUTION_HIGH</span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-brand-500 rounded-sm shadow-[0_0_10px_#a87932]" />
                        <span className="text-[9px] font-black text-industrial-400 uppercase tracking-widest italic">Historical Vector</span>
                     </div>
                  </div>
               </div>

               <div className="w-full h-[380px] -ml-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="deepBronze" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a87932" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a87932" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#473c31" vertical={false} opacity={0.15} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#473c31"
                        tick={{ fill: '#635445', fontSize: 10, fontWeight: 'bold' }}
                        tickLine={{ stroke: '#473c31' }}
                      />
                      <YAxis 
                        stroke="#473c31"
                        tick={{ fill: '#635445', fontSize: 10, fontWeight: 'bold' }}
                        tickLine={{ stroke: '#473c31' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f0d0a', 
                          border: '1px solid #473c31',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#e6d5bc'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#a87932" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#deepBronze)" 
                        isAnimationActive={true}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-industrial-950/40 backdrop-blur-xl border border-brand-500/10 rounded-xl p-6 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex-1">
               <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-brand-500/10">Summary Statistics</h3>
               <div className="space-y-8">
                  <div className="group">
                     <p className="text-[9px] text-industrial-600 font-bold uppercase tracking-widest mb-1">Average Cycle Value</p>
                     <p className="text-3xl font-black text-white font-mono">{stats.avg}</p>
                     <div className="w-12 h-1 bg-brand-500/20 rounded-full mt-2" />
                  </div>
                  <div className="group">
                     <p className="text-[9px] text-industrial-600 font-bold uppercase tracking-widest mb-1">Maximum Peak Point</p>
                     <p className="text-3xl font-black text-white font-mono">{stats.max}</p>
                     <div className="w-8 h-1 bg-red-500/20 rounded-full mt-2" />
                  </div>
                  <div className="group">
                     <p className="text-[9px] text-industrial-600 font-bold uppercase tracking-widest mb-1">Minimum Floor Point</p>
                     <p className="text-3xl font-black text-white font-mono">{stats.min}</p>
                     <div className="w-6 h-1 bg-green-500/20 rounded-full mt-2" />
                  </div>
                  <div className="pt-6 border-t border-brand-500/5 items-center justify-between flex">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-industrial-700 font-bold uppercase">System Status</span>
                        <span className="text-[10px] text-green-500 font-black uppercase">STABLE_NORM</span>
                     </div>
                     <Activity size={16} className="text-brand-700 opacity-30" />
                  </div>
               </div>
            </div>

            <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-6 relative overflow-hidden h-auto group transition-all shadow-inner">
               <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Download size={14} /> Intelligence Export
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/download/pdf?token=${token}`, '_blank');
                      }}
                      className="flex items-center justify-between px-3 py-2 bg-industrial-950/60 border border-brand-500/20 rounded-lg group/btn hover:border-brand-500 transition-all"
                    >
                      <span className="text-[9px] font-black text-industrial-400 uppercase group-hover/btn:text-brand-500 transition-colors">Generate PDF</span>
                      <Download size={12} className="text-industrial-600 group-hover/btn:text-brand-500" />
                    </button>

                    <button 
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/download/excel?token=${token}`, '_blank');
                      }}
                      className="flex items-center justify-between px-3 py-2 bg-industrial-950/60 border border-brand-500/20 rounded-lg group/btn hover:border-brand-500 transition-all"
                    >
                      <span className="text-[9px] font-black text-industrial-400 uppercase group-hover/btn:text-brand-500 transition-colors">Full Excel DB</span>
                      <Database size={12} className="text-industrial-600 group-hover/btn:text-brand-500" />
                    </button>

                    <button 
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/download/csv?token=${token}`, '_blank');
                      }}
                      className="flex items-center justify-between px-3 py-2 bg-industrial-950/60 border border-brand-500/20 rounded-lg group/btn hover:border-brand-500 transition-all"
                    >
                      <span className="text-[9px] font-black text-industrial-400 uppercase group-hover/btn:text-brand-500 transition-colors">Raw CSV Node</span>
                      <RefreshCw size={12} className="text-industrial-600 group-hover/btn:text-brand-500" />
                    </button>
                  </div>

                  <p className="text-[8px] text-industrial-600 leading-relaxed uppercase tracking-tighter mt-1 italic">
                     *Reports include 50-cycle history & critical anomaly forensic data.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
