import React from "react";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";

interface AlertStatsProps {
  stats: {
    critical: number;
    warning: number;
    acknowledged: number;
    avgResponse: string;
  };
}

export const AlertStats: React.FC<AlertStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card-premium p-6 flex items-center justify-between border-red-500/20 bg-red-500/[0.02]">
        <div>
          <p className="text-[10px] text-industrial-500 uppercase font-black tracking-[0.2em] mb-1">Critical Force</p>
          <p className="text-3xl font-black text-red-500 tracking-tighter tabular-nums">{stats.critical}</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <ShieldAlert size={22} className="animate-pulse" />
        </div>
      </div>

      <div className="card-premium p-6 flex items-center justify-between border-brand-500/20 bg-brand-500/[0.02]">
        <div>
          <p className="text-[10px] text-industrial-500 uppercase font-black tracking-[0.2em] mb-1">Warning Pulse</p>
          <p className="text-3xl font-black text-brand-main tracking-tighter tabular-nums">{stats.warning}</p>
        </div>
        <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-main">
          <AlertTriangle size={22} />
        </div>
      </div>

      <div className="card-premium p-6 flex items-center justify-between border-emerald-500/20 bg-emerald-500/[0.02]">
        <div>
          <p className="text-[10px] text-industrial-500 uppercase font-black tracking-[0.2em] mb-1">Cleared Nodes</p>
          <p className="text-3xl font-black text-emerald-500 tracking-tighter tabular-nums">{stats.acknowledged}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
          <CheckCircle size={22} />
        </div>
      </div>

      <div className="card-premium p-6 flex items-center justify-between border-white/5 bg-white/[0.01]">
        <div>
          <p className="text-[10px] text-industrial-500 uppercase font-black tracking-[0.2em] mb-1">Response Latency</p>
          <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{stats.avgResponse}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-industrial-400">
          <Clock size={22} />
        </div>
      </div>
    </div>
  );
};
