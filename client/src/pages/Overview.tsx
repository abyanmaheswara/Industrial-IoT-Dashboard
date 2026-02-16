import React from 'react';
import type { SensorData } from '../types/sensor';
import { SensorWidget } from '../components/SensorWidget';
import { HealthWidget } from '../components/HealthWidget';
import { 
  CheckCircle, 
  Zap, 
  Activity, 
  Bell, 
  Clock, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface OverviewProps {
  sensorData: SensorData[];
  powerHistory: SensorData[];
  alerts?: any[];
}

export const Overview: React.FC<OverviewProps> = ({ sensorData, powerHistory, alerts = [] }) => {
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  
  const sensorsHealth = (sensors: SensorData[]) => {
    if (sensors.length === 0) return 100;
    const total = sensors.reduce((acc, s) => acc + (s.health || 100), 0);
    return Math.round(total / sensors.length);
  };

  const avgHealth = sensorsHealth(sensorData);
  const totalPower = sensorData.find(s => s.id === 'pwr_01')?.value || 0;

  return (
    <div className="px-6 py-6 overflow-y-auto h-full space-y-6 custom-scrollbar relative">
      <div className="industrial-grid absolute inset-0 opacity-5 pointer-events-none" />

      {/* 1. TOP KPI BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-industrial-950/40 backdrop-blur-xl border border-brand-500/20 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500/40" />
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
               <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">System Health</p>
              <h4 className="text-xl font-black text-white">{avgHealth}%</h4>
            </div>
          </div>
          <div className="mt-3 h-1 w-full bg-industrial-900 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${avgHealth}%` }} />
          </div>
        </div>

        <div className="bg-industrial-950/40 backdrop-blur-xl border border-brand-500/20 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500/40" />
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500">
               <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Power usage</p>
              <h4 className="text-xl font-black text-white">{totalPower} <span className="text-xs text-brand-500">kW</span></h4>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[9px] text-brand-600 font-mono">
             <TrendingUp size={10} /> +2.4% vs prev hour
          </div>
        </div>

        <div className="bg-industrial-950/40 backdrop-blur-xl border border-brand-500/20 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500/40" />
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${activeAlertsCount > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-industrial-800/40 border-industrial-700/40 text-industrial-500'}`}>
               <Bell size={20} className={activeAlertsCount > 0 ? 'animate-bounce' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Active signals</p>
              <h4 className="text-xl font-black text-white">{activeAlertsCount}</h4>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-industrial-600 font-bold uppercase tracking-tighter">SEC_B12 Perimeter Monitor</p>
        </div>

        <div className="bg-industrial-950/40 backdrop-blur-xl border border-brand-500/20 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-500/40" />
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
               <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Sys Uptime</p>
              <h4 className="text-xl font-black text-white font-mono uppercase">14:02:55</h4>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-industrial-600 font-bold uppercase tracking-tighter">Lvl 3 Auth Established</p>
        </div>
      </div>

      {/* 2. MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-industrial-950/40 backdrop-blur-xl rounded-xl border border-brand-500/20 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden min-h-[400px]">
           <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-500/40 rounded-tl" />
           <div className="p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-white tracking-[0.25em] uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-500" />
                    Telemetric Trend Monitor
                  </h2>
                </div>
              </div>

              {powerHistory.length > 0 ? (
                <div className="w-full h-[320px] -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={powerHistory}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a87932" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a87932" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#473c31" vertical={false} opacity={0.2} />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#473c31"
                        tick={{ fill: '#635445', fontSize: 9, fontWeight: 'bold' }}
                        tickFormatter={(t) => typeof t === 'number' ? new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : t}
                      />
                      <YAxis stroke="#473c31" tick={{ fill: '#635445', fontSize: 9, fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#110f0c', 
                          border: '1px solid #473c31',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: '#e6d5bc'
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#a87932" strokeWidth={2} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center opacity-30">
                   <div className="w-12 h-12 border-2 border-industrial-800 border-t-brand-500 rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-industrial-500">Synchronizing sensors...</p>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <HealthWidget sensors={sensorData} aiEnabled={true} />
           <div className="flex-1 bg-industrial-950/40 backdrop-blur-xl border border-brand-500/20 rounded-xl p-5 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
              <h3 className="text-[10px] font-black text-brand-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                 Emergency Log Stream
              </h3>
              <div className="space-y-3">
                 {alerts.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 opacity-30">
                      <CheckCircle size={32} className="mb-2" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-center">No anomalies detected</span>
                   </div>
                 ) : (
                   alerts.slice(0, 3).map((a, i) => (
                     <div key={i} className={`p-3 rounded-lg border-l-2 ${a.type === 'critical' ? 'bg-red-500/5 border-red-500/40' : 'bg-brand-500/5 border-brand-500/40'} text-[10px]`}>
                        <div className="flex justify-between items-center mb-1 font-black uppercase">
                           <span>{a.sensor_id}</span>
                           <span className="text-[8px] opacity-50">{new Date(a.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="opacity-70 truncate">{a.message}</p>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="relative">
         <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xs font-black text-white tracking-[0.3em] uppercase">Sensor Matrix Array</h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-brand-500/30 to-transparent" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
           {sensorData.length > 0 ? (
             sensorData.map(sensor => (
               <div key={sensor.id}>
                 <SensorWidget data={sensor} />
               </div>
             ))
           ) : (
             Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="bg-industrial-900/40 rounded-lg h-32 animate-pulse border border-brand-500/10" />
             ))
           )}
         </div>
      </div>
    </div>
  );
};
