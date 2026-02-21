import React, { useMemo, useState, useEffect } from "react";
import type { SensorData } from "../types/sensor";
import { SensorWidget } from "../components/SensorWidget";
import { HealthWidget } from "../components/HealthWidget";
import { Droplets, Thermometer, ShieldCheck, TrendingUp, Cpu, Activity, Bell } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface OverviewProps {
  sensorData: SensorData[];
  powerHistory: SensorData[];
  alerts?: any[];
  mqttStatus?: { connected: boolean; clients: number };
}

export const Overview: React.FC<OverviewProps> = ({ sensorData, powerHistory, alerts = [], mqttStatus }) => {
  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;

  // Build chart history locally from sensorData changes for instant re-render
  const [localHistory, setLocalHistory] = useState<{ timestamp: number; value: number }[]>([]);

  useEffect(() => {
    const tempSensor = sensorData.find((s) => s.id === "dht_temp" || s.type === "temperature");
    if (tempSensor && tempSensor.value !== undefined) {
      setLocalHistory((prev) => {
        const last = prev[prev.length - 1];
        // Avoid exact duplicate points
        if (last && last.value === tempSensor.value) return prev;
        return [...prev, { timestamp: Date.now(), value: Number(tempSensor.value) }].slice(-60);
      });
    }
  }, [sensorData]);

  // Use localHistory if it has data, fallback to powerHistory prop
  const chartData = localHistory.length > 0 ? localHistory : powerHistory;

  const avgHealth = useMemo(() => {
    if (sensorData.length === 0) return 100;
    const total = sensorData.reduce((acc, s) => acc + (s.health || 100), 0);
    return Math.round(total / sensorData.length);
  }, [sensorData]);

  const primaryHumidity = useMemo(() => {
    return sensorData.find((s) => s.type === "humidity")?.value || 0;
  }, [sensorData]);

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 h-full overflow-y-auto custom-scrollbar relative">
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.03] pointer-events-none" />

      {/* 1. TELEMETRIC KPI BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
        {[
          { label: "Stability Matrix", val: `${avgHealth}%`, icon: ShieldCheck, color: "text-emerald-500", bar: avgHealth, barColor: "bg-emerald-500" },
          { label: "Ambient Moisture", val: `${primaryHumidity}%`, icon: Droplets, color: "text-brand-main", sub: primaryHumidity > 70 ? "Status: HIGH" : "Status: OPTIMAL", subIcon: TrendingUp },
          { label: "Signal Protocol", val: mqttStatus?.connected ? "ONLINE" : "OFFLINE", icon: Activity, color: mqttStatus?.connected ? "text-emerald-500" : "text-red-500", sub: `Nodes: ${mqttStatus?.clients || 0}`, subIcon: Cpu },
          { label: "Deviations Detected", val: activeAlertsCount, icon: Bell, color: activeAlertsCount > 0 ? "text-red-500" : "text-industrial-500", pulse: activeAlertsCount > 0 },
        ].map((kpi, i) => (
          <div key={i} className="card-premium p-6 group hover:border-brand-main/20 transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/5 ${kpi.color} shadow-inner`}>
                <kpi.icon size={22} className={(kpi as any).pulse ? "animate-pulse" : ""} />
              </div>
              <div>
                <p className="text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                <h4 className={`text-2xl font-black text-white ${(kpi as any).mono ? "font-mono" : "tracking-tighter"}`}>{kpi.val}</h4>
              </div>
            </div>
            {kpi.bar !== undefined && (
              <div className="mt-5 h-1.5 w-full bg-industrial-950 rounded-full overflow-hidden border border-white/[0.02]">
                <div className={`h-full ${kpi.barColor} transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]`} style={{ width: `${kpi.bar}%` }} />
              </div>
            )}
            {kpi.sub && (
              <div className="mt-4 flex items-center gap-2 text-[9px] text-brand-main/60 font-black uppercase tracking-widest italic">
                <kpi.subIcon size={10} /> {kpi.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2. CORE ANALYTICS ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 relative z-10">
        <div className="lg:col-span-8 card-premium relative group border-white/5">
          <div className="p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
              <div className="flex flex-col">
                <h2 className="text-[11px] font-black text-white tracking-[0.4em] uppercase flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-brand-main animate-pulse" />
                  Thermal Analytics Matrix
                </h2>
                <span className="text-[9px] text-industrial-600 font-mono mt-2 tracking-widest uppercase italic">Node_Source: DHT22_ESP32 // HARDWARE_REALTIME</span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-black text-brand-main uppercase tracking-widest">Live_Sync</div>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="w-full h-[400px] -ml-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="fluxBronze" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b45309" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#473c31" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#473c31"
                      tick={{ fill: "#635445", fontSize: 10, fontWeight: "bold" }}
                      tickFormatter={(t) => (typeof t === "number" ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t)}
                    />
                    <YAxis stroke="#473c31" tick={{ fill: "#635445", fontSize: 10, fontWeight: "bold" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d0b09",
                        border: "1px solid #473c31",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#e6d5bc",
                      }}
                      itemStyle={{ color: "#b45309", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#b45309" strokeWidth={3} fill="url(#fluxBronze)" animationDuration={1000} isAnimationActive={true} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center opacity-30">
                <div className="w-16 h-16 border-2 border-white/5 border-t-brand-main rounded-2xl animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-industrial-500">Syncing with Node Network...</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <HealthWidget sensors={sensorData} aiEnabled={true} />

          <div className="flex-1 card-premium p-8 relative group border-white/5 bg-white/[0.01]">
            <h3 className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <div className="w-2 h-2 bg-brand-main rounded-full animate-pulse shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
              Incident Buffer
            </h3>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-10">
                  <ShieldCheck size={48} className="mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sector Locked</span>
                </div>
              ) : (
                alerts.slice(0, 4).map((a, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border transition-all duration-300 ${a.type === "critical" ? "bg-red-500/[0.03] border-red-500/20" : "bg-white/[0.02] border-white/5"} group/item hover:bg-white/[0.05] hover:border-brand-main/20`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${a.type === "critical" ? "text-red-500" : "text-brand-main"}`}>{a.sensor_id}</span>
                      <span className="text-[9px] text-industrial-600 font-mono font-bold italic">{new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-[11px] text-industrial-400 group-hover/item:text-industrial-200 transition-colors line-clamp-2 leading-relaxed">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SENSOR MATRIX ARRAY */}
      <div className="relative z-10">
        <div className="flex items-center gap-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-main/10 rounded-lg border border-brand-main/20 text-brand-main">
              <Cpu size={18} />
            </div>
            <h2 className="text-[13px] font-black text-white tracking-[0.3em] uppercase">Peripheral Matrix_01</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-brand-main/20 via-brand-main/5 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-industrial-500 tracking-widest uppercase">Nodes_Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {sensorData.length > 0
            ? sensorData.map((sensor) => (
                <div key={sensor.id} className="animate-in fade-in zoom-in-95 duration-700">
                  <SensorWidget data={sensor} />
                </div>
              ))
            : Array.from({ length: 6 }).map((_, i) => <div key={i} className="card-premium h-64 animate-pulse bg-white/[0.02] border-white/5" />)}
        </div>
      </div>
    </div>
  );
};
