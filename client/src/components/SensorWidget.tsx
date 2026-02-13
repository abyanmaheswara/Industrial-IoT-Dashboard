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
  const statusColor = getStatusColor(data.status);
  const statusBg = getStatusBg(data.status);
  
  // Anomaly styling
  const anomalyClass = data.isAnomaly ? 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : '';

  return (
    <div className={`card p-6 relative overflow-hidden transition-all duration-300 ${data.status === 'critical' ? 'animate-pulse border-alert-critical' : ''} ${anomalyClass}`}>
      {data.isAnomaly && (
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-bl font-bold z-10">
            ANOMALY
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${statusBg} ${statusColor}`}>
          {getIcon(data.type)}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusBg} ${statusColor}`}>
          {data.status}
        </div>
      </div>
      
      <div>
        <h3 className="text-industrial-400 text-sm font-medium mb-1">{data.name}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white tracking-tight">{data.value}</span>
          <span className="ml-1 text-industrial-500 font-medium">{data.unit}</span>
        </div>
        {data.health !== undefined && (
            <div className="mt-2 w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${data.health > 70 ? 'bg-green-500' : data.health > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${data.health}%` }}
                />
            </div>
        )}
      </div>

      {/* Mini sparkline or visual indicator for threshold could go here */}
      <div className="absolute bottom-0 left-0 h-1 bg-industrial-800 w-full">
         <div 
           className={`h-full transition-all duration-500 ${data.status === 'critical' ? 'bg-alert-critical' : data.status === 'warning' ? 'bg-alert-warning' : 'bg-alert-success'}`} 
           style={{ width: '100%' }} // In a real app, this would be proportional to max value
         ></div>
      </div>
    </div>
  );
};
