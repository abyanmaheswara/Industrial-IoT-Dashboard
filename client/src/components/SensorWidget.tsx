import React, { useState, useEffect } from "react";
import type { SensorData } from "../types/sensor";
import { Activity, Thermometer, Zap, Gauge, Droplets, Database, Power } from "lucide-react";
import { socket } from "../socket";

interface SensorWidgetProps {
  data: SensorData;
}

export const SensorWidget: React.FC<SensorWidgetProps> = ({ data }) => {
  const [unitSystem, setUnitSystem] = useState("Celsius");
  const [isUpdating, setIsUpdating] = useState(false);

  // Flash on data update
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 600);
    return () => clearTimeout(timer);
  }, [data.value]);

  useEffect(() => {
    const saved = localStorage.getItem("settings_temp_unit");
    if (saved) setUnitSystem(saved);

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tempUnit) {
        setUnitSystem(customEvent.detail.tempUnit);
      }
    };

    window.addEventListener("settingsChanged", handleSettingsChange);
    return () => window.removeEventListener("settingsChanged", handleSettingsChange);
  }, []);

  const isCritical = data.status === "critical" || (data.health && data.health < 40);
  const isWarning = data.status === "warning" || (data.health && data.health < 70);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "temperature":
        return <Thermometer className="w-5 h-5" />;
      case "humidity":
        return <Droplets className="w-5 h-5" />;
      case "power":
        return <Zap className="w-5 h-5" />;
      case "vibration":
        return <Activity className="w-5 h-5" />;
      case "pressure":
        return <Gauge className="w-5 h-5" />;
      case "relay":
        return <Power className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const statusStyles: Record<string, string> = {
    normal: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-brand-main bg-brand-main/10 border-brand-main/20",
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
    unknown: "text-industrial-500 bg-industrial-950/40 border-white/5",
  };

  const currentStatus = data.status as string;

  // Unit Conversion Logic
  let displayValue = data.value;
  let displayUnit = data.unit;

  if (data.type === "temperature" && unitSystem === "Fahrenheit" && typeof data.value === "number") {
    displayValue = Number(((data.value * 9) / 5 + 32).toFixed(1));
    displayUnit = "°F";
  }

  const isRelay = data.type === "relay";
  const isOn = data.value === 1;

  const handleToggle = () => {
    const newValue = isOn ? 0 : 1;
    // Emit command to backend
    socket.emit("deviceCommand", {
      deviceId: data.id,
      value: newValue,
    });
  };

  return (
    <div
      className={`card-premium p-6 group relative h-full flex flex-col justify-between transition-all duration-300 ${isCritical ? "border-red-500/30 bg-red-500/[0.02]" : isWarning ? "border-brand-main/30" : ""} ${isUpdating ? "border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]" : ""}`}
    >
      <div className="scanline-premium opacity-[0.03] rounded-2xl" />

      {/* Sensor Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div
          className={`p-3 rounded-2xl border transition-all duration-500 ${
            isCritical
              ? "bg-red-500/10 border-red-500/30 text-red-500"
              : isWarning
                ? "bg-brand-main/10 border-brand-main/30 text-brand-light"
                : "bg-white/[0.03] border-white/5 text-industrial-400 group-hover:text-brand-light group-hover:border-brand-main/20"
          }`}
        >
          {getTypeIcon(data.type)}
        </div>

        <div className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${statusStyles[currentStatus] || statusStyles.unknown}`}>{data.status || "OFFLINE"}</div>
      </div>

      {/* Value Display */}
      <div className="relative z-10 mb-6">
        {isRelay ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-black tracking-tighter leading-none transition-colors ${isOn ? "text-brand-light" : "text-industrial-600"}`}>{isOn ? "ACTIVE" : "OFFLINE"}</span>
            </div>
            <button
              onClick={handleToggle}
              className={`w-full py-3 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 ${
                isOn ? "bg-brand-main text-white border-brand-light shadow-[0_0_20px_rgba(180,83,9,0.3)]" : "bg-industrial-950/40 text-industrial-500 border-white/5 hover:border-white/10"
              }`}
            >
              <Power size={14} className={isOn ? "animate-pulse" : ""} />
              {isOn ? "Command: SHUTDOWN" : "Command: ACTIVATE"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-black tracking-tighter leading-none transition-all duration-300 ${isUpdating ? "text-sky-400 scale-105" : "text-white"} group-hover:text-brand-light`}>
                {typeof displayValue === "number" ? displayValue.toFixed(1) : displayValue}
              </span>
              <span className="text-sm font-bold text-industrial-500 uppercase tracking-widest mb-1">{displayUnit}</span>
            </div>
          </>
        )}
        <p className="text-[10px] font-black text-industrial-600 uppercase tracking-[0.25em] mt-3">{data.name}</p>
      </div>

      {/* Telemetric Footer */}
      <div className="pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? "bg-red-500 pulse-status" : "bg-emerald-500"} opacity-70`} />
            <span className="text-[9px] font-mono font-bold text-industrial-500">{data.id}</span>
          </div>
          <span className={`text-[8px] font-mono italic transition-all duration-300 ${isUpdating ? "text-sky-400 animate-pulse" : "text-industrial-700"}`}>{isUpdating ? "↑ TX" : "SYNC_OK"}</span>
        </div>

        <div className="w-full bg-industrial-950 h-1 rounded-full overflow-hidden border border-white/[0.02]">
          <div
            className={`h-full bg-gradient-to-r ${isCritical ? "from-red-600 to-red-400" : isWarning ? "from-brand-600 to-brand-400" : "from-emerald-600 to-emerald-400"} transition-all duration-1000 ease-in-out`}
            style={{ width: `${data.health || 100}%` }}
          />
        </div>
      </div>

      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
