import React from "react";
import { AlertTriangle, ShieldCheck, Activity, Heart } from "lucide-react";
import type { SensorData } from "../types/sensor";

interface HealthWidgetProps {
  sensors: SensorData[];
  aiEnabled: boolean;
}

export const HealthWidget: React.FC<HealthWidgetProps> = ({ sensors, aiEnabled }) => {
  const averageHealth = sensors.length > 0 ? Math.round(sensors.reduce((acc, s) => acc + (s.health || 100), 0) / sensors.length) : 100;

  const anomalies = sensors.filter((s) => s.status === "critical" || (s.health && s.health < 40));

  const getHealthColor = (val: number) => {
    if (val > 80) return "text-emerald-500";
    if (val > 50) return "text-brand-main";
    return "text-red-500";
  };

  const getHealthGradient = (val: number) => {
    if (val > 80) return "from-emerald-600 to-emerald-400";
    if (val > 50) return "from-brand-main to-brand-light";
    return "from-red-600 to-red-400";
  };

  return (
    <div className="card-premium p-8 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 rotate-45 -mr-16 -mt-16 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-brand-main">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-[11px] font-black text-white/90 uppercase tracking-[0.3em]">Health Intelligence_v4.2</h3>
        </div>
        {aiEnabled && (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-main/10 border border-brand-main/20 rounded-md">
            <span className="text-[9px] font-black text-brand-light uppercase tracking-tighter italic">AI_CORRELATOR: ACTIVE</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mb-6">
        <div>
          <div className={`text-5xl font-black mb-2 tracking-tighter ${getHealthColor(averageHealth)}`}>
            {averageHealth}
            <span className="text-xl ml-1 font-bold opacity-50">%</span>
          </div>
          <p className="text-[10px] font-bold text-industrial-500 uppercase tracking-widest leading-relaxed">
            System-Wide Operational <br />
            Stability Matrix
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 mb-1">
          <Activity size={32} className={`${getHealthColor(averageHealth)} opacity-20`} />
          <span className="text-[8px] font-mono text-industrial-600 uppercase">UPLINK_NODE: STABLE</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full bg-industrial-950 rounded-full h-2 border border-white/[0.03] overflow-hidden shadow-inner p-0.5">
          <div className={`h-full bg-gradient-to-r ${getHealthGradient(averageHealth)} rounded-full shadow-[0_0_15px_rgba(180,83,9,0.2)] transition-all duration-1000 ease-out`} style={{ width: `${averageHealth}%` }} />
        </div>

        <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl p-4 group-hover:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-red-500/50" />
            <span className="text-[10px] font-bold text-industrial-400 uppercase tracking-widest">Core Integrity</span>
          </div>
          <span className="text-[9px] font-mono font-black text-emerald-500 uppercase px-2 py-0.5 border border-emerald-500/20 rounded bg-emerald-500/5">Nominal</span>
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="mt-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-4 animate-pulse">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-400 font-bold uppercase leading-relaxed tracking-tighter">AI identifies urgent degradation in node array. Corrective protocol initialization required.</p>
        </div>
      )}
    </div>
  );
};

export default HealthWidget;
