import { useState, useEffect } from 'react';
import type { SensorData } from '../types/sensor';
import { Activity, Thermometer, Zap, Gauge } from 'lucide-react';

interface SensorWidgetProps {
  data: SensorData;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'temperature': return <Thermometer size={24} />;
    case 'pressure': return <Gauge size={24} />;
    case 'power': return <Zap size={24} />;
    case 'vibration': return <Activity size={24} />;
    default: return <Activity size={24} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'text-alert-critical border-alert-critical';
    case 'warning': return 'text-alert-warning border-alert-warning';
    default: return 'text-alert-success border-alert-success';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-alert-critical/10';
    case 'warning': return 'bg-alert-warning/10';
    default: return 'bg-alert-success/10';
  }
};

export const SensorWidget = ({ data }: SensorWidgetProps) => {
  const [unitSystem, setUnitSystem] = useState('Celsius');

  useEffect(() => {
    // Load initial setting
    const saved = localStorage.getItem('settings_temp_unit');
    if (saved) setUnitSystem(saved);

    // Listen for changes
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tempUnit) {
        setUnitSystem(customEvent.detail.tempUnit);
      }
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  const statusColor = getStatusColor(data.status);
  const statusBg = getStatusBg(data.status);
  
  // Anomaly styling
  const anomalyClass = data.isAnomaly ? 'ring-1 ring-brand-500 shadow-[0_0_20px_rgba(168,121,50,0.3)]' : '';

  // Unit Conversion Logic
  let displayValue = data.value;
  let displayUnit = data.unit;

  if (data.type === 'temperature' && unitSystem === 'Fahrenheit') {
     displayValue = Number((data.value * 9/5 + 32).toFixed(1));
     displayUnit = '°F';
  }

  return (
    <div className={`relative group bg-industrial-950/40 backdrop-blur-xl border border-brand-500/10 p-5 rounded-lg transition-all duration-500 hover:border-brand-500/30 hover:bg-industrial-950/60 ${data.status === 'critical' ? 'animate-pulse' : ''} ${anomalyClass}`}>
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-500/20 rounded-tl group-hover:border-brand-500/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-500/20 rounded-br group-hover:border-brand-500/50 transition-colors" />

      {data.isAnomaly && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-brand-400 text-white text-[9px] px-3 py-1 rounded-bl-lg font-black tracking-widest z-10 animate-fade-in shadow-[0_0_15px_rgba(168,121,50,0.4)]">
            ANOMALY
        </div>
      )}

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`p-2.5 rounded-lg ${statusBg} ${statusColor} border border-current opacity-80 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
          {getIcon(data.type)}
        </div>
        <div className="flex flex-col items-end">
            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${statusBg} ${statusColor} border border-current/20`}>
                {data.status}
            </div>
            <span className="text-[8px] text-industrial-600 font-mono mt-1">REF_{data.id.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-industrial-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">{data.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(168,121,50,0.4)]">
            {displayValue}
          </span>
          <span className="text-xs text-brand-400 font-bold uppercase opacity-80 tracking-wider font-mono">{displayUnit}</span>
        </div>
        
        {data.health !== undefined && (
            <div className="mt-4 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-industrial-600 uppercase tracking-widest">Component Health</span>
                    <span className={data.health > 70 ? 'text-green-500' : data.health > 30 ? 'text-yellow-500' : 'text-red-500'}>
                        {Math.round(data.health)}%
                    </span>
                </div>
                <div className="w-full bg-industrial-950/40 h-1 rounded-full overflow-hidden border border-brand-900/10">
                    <div 
                        className={`h-full transition-all duration-1000 ${data.health > 70 ? 'bg-green-500' : data.health > 30 ? 'bg-yellow-500' : 'bg-red-500'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} 
                        style={{ width: `${data.health}%` }}
                    />
                </div>
            </div>
        )}
      </div>

      {/* Threshold indicator line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-industrial-900 w-full overflow-hidden rounded-b-lg">
         <div 
           className={`h-full transition-all duration-1000 ${data.status === 'critical' ? 'bg-alert-critical' : data.status === 'warning' ? 'bg-alert-warning' : 'bg-alert-success'} opacity-40 shadow-[0_0_10px_currentColor]`} 
           style={{ width: '100%' }}
         ></div>
      </div>

      {/* Glossy Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
