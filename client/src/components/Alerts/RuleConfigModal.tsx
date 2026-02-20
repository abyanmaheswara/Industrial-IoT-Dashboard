import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle, ShieldCheck } from "lucide-react";

interface SensorConfig {
  id: string;
  name: string;
  threshold: number;
  min: number;
  max: number;
  baseline: number;
}

interface RuleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const RuleConfigModal: React.FC<RuleConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch current configs on mount
  useEffect(() => {
    if (isOpen) {
      fetchSensors();
    }
  }, [isOpen]);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/sensors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSensors(data);
    } catch (err) {
      setError("Failed to load command parameters");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof SensorConfig, value: string) => {
    setSensors((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: parseFloat(value) } : s)));
  };

  const handleSave = async (sensor: SensorConfig) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/sensors/${sensor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sensor),
      });

      if (!res.ok) throw new Error("Update failed");

      onSave();
      // Optional: Visual feedback notification instead of alert
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-4 overflow-hidden">
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.05] pointer-events-none" />

      <div className="bg-industrial-950 border border-white/5 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col relative card-premium">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-brand-main/10 rounded-xl border border-brand-main/20 text-brand-main shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-white uppercase tracking-[0.4em]">Operational Directives</h2>
              <p className="text-[10px] text-industrial-500 uppercase tracking-widest mt-1">Configuring sector-level threshold parameters // Protocol-V8</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-industrial-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="w-12 h-12 border-2 border-white/5 border-t-brand-main rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Accessing Node Database...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-500">
              <AlertTriangle size={48} className="mb-4 opacity-50" />
              <p className="text-[12px] font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-industrial-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="pb-6 font-black">Designation</th>
                    <th className="pb-6 font-black">Min_Limit</th>
                    <th className="pb-6 font-black">Max_Limit</th>
                    <th className="pb-6 font-black text-brand-main">Critical_Node</th>
                    <th className="pb-6 font-black text-right">Commit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.01]">
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-6">
                        <div className="text-[12px] text-white font-black uppercase tracking-widest">{sensor.name}</div>
                        <div className="text-[9px] text-industrial-600 font-mono tracking-tighter mt-1">{sensor.id.toUpperCase()}</div>
                      </td>
                      <td className="py-6">
                        <input
                          type="number"
                          className="bg-industrial-950 border border-white/5 rounded-lg px-4 py-2.5 w-24 text-white text-[11px] font-mono focus:border-brand-main/40 focus:outline-none transition-all shadow-inner"
                          value={sensor.min}
                          onChange={(e) => handleChange(sensor.id, "min", e.target.value)}
                        />
                      </td>
                      <td className="py-6">
                        <input
                          type="number"
                          className="bg-industrial-950 border border-white/5 rounded-lg px-4 py-2.5 w-24 text-white text-[11px] font-mono focus:border-brand-main/40 focus:outline-none transition-all shadow-inner"
                          value={sensor.max}
                          onChange={(e) => handleChange(sensor.id, "max", e.target.value)}
                        />
                      </td>
                      <td className="py-6">
                        <input
                          type="number"
                          className="bg-industrial-950 border border-brand-main/20 rounded-lg px-4 py-2.5 w-28 text-brand-main font-black text-[11px] font-mono focus:border-brand-main/50 focus:outline-none transition-all shadow-inner"
                          value={sensor.threshold}
                          onChange={(e) => handleChange(sensor.id, "threshold", e.target.value)}
                        />
                      </td>
                      <td className="py-6 text-right">
                        <button onClick={() => handleSave(sensor)} className="p-3 bg-brand-main/10 hover:bg-brand-main/20 text-brand-main border border-brand-main/20 rounded-xl transition-all group/btn" title="Commit Directive">
                          <Save size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3 text-[9px] text-industrial-600 uppercase font-black tracking-widest">
            <div className="w-1.5 h-1.5 bg-brand-main rounded-full animate-pulse shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
            Ready for Signal Override
          </div>
          <button onClick={onClose} className="btn-premium px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
            TERMINATE_PROCEDURE
          </button>
        </div>
      </div>
    </div>
  );
};
