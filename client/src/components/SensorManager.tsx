import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit2, Trash2, X, Save, Activity, Database, AlertCircle, Thermometer, Droplets, Zap, Gauge, Power } from "lucide-react";

interface Sensor {
  id: string;
  name: string;
  type: string;
  unit: string;
  threshold: number;
  status?: string;
}

const SensorManager: React.FC = () => {
  const { user } = useAuth();
  const { refreshData } = useOutletContext<{ refreshData: () => Promise<void> }>();
  const isViewer = user?.role === "viewer";
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "generic",
    unit: "",
    threshold: 80,
  });

  const fetchSensors = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/sensors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSensors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch sensors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleOpenModal = (sensor?: Sensor) => {
    if (sensor) {
      setEditingSensor(sensor);
      setFormData({
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        threshold: sensor.threshold,
      });
    } else {
      setEditingSensor(null);
      setFormData({
        id: "",
        name: "",
        type: "generic",
        unit: "",
        threshold: 80,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sensor? Data collection will stop.")) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/sensors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSensors();
      refreshData();
    } catch (err) {
      alert("Failed to delete sensor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      if (editingSensor) {
        await fetch(`${API_URL}/api/sensors/${editingSensor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        const res = await fetch(`${API_URL}/api/sensors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to provision sensor");
        }
      }
      setIsModalOpen(false);
      fetchSensors();
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="card-premium overflow-hidden border-white/5">
      <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-wrap justify-between items-center gap-6">
        <div>
          <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <Database className="w-4 h-4 text-brand-main" />
            Hardware Component Registry
          </h3>
          <p className="text-[9px] text-industrial-600 font-mono mt-1 uppercase tracking-widest italic">Inventory_System // Live_Node_Configuration</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={isViewer}
          className={`btn-premium px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group ${isViewer ? "opacity-50 cursor-not-allowed filter grayscale" : ""}`}
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
          Add Peripheral Node
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-industrial-950/60 border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Node ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Callsign</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Class</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Metric</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Limit</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-industrial-500 uppercase tracking-widest">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {sensors.map((sensor) => (
              <tr key={sensor.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6 text-[11px] font-mono text-industrial-400 group-hover:text-industrial-200">{sensor.id.toUpperCase()}</td>
                <td className="px-8 py-6 text-[12px] font-black text-white uppercase tracking-widest">{sensor.name}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-industrial-500">
                      {sensor.type === "temperature" && <Thermometer size={12} className="text-brand-main" />}
                      {sensor.type === "humidity" && <Droplets size={12} className="text-brand-main" />}
                      {sensor.type === "vibration" && <Activity size={12} className="text-brand-main" />}
                      {sensor.type === "pressure" && <Gauge size={12} className="text-brand-main" />}
                      {sensor.type === "power" && <Zap size={12} className="text-brand-main" />}
                      {sensor.type === "relay" && <Power size={12} className="text-brand-main" />}
                      {!["temperature", "humidity", "vibration", "pressure", "power", "relay"].includes(sensor.type) && <Database size={12} />}
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white/5 text-industrial-500 text-[9px] font-black uppercase tracking-tighter border border-white/5">{sensor.type}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-[11px] font-bold text-industrial-400">{sensor.unit || "UNITS"}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-brand-main text-[11px] font-black">
                    {sensor.threshold}
                    <AlertCircle size={10} className="opacity-50" />
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleOpenModal(sensor)}
                      disabled={isViewer}
                      className={`p-2.5 bg-brand-main/10 hover:bg-brand-main/20 text-brand-main border border-brand-main/20 rounded-xl transition-all ${isViewer ? "opacity-30 cursor-not-allowed" : ""}`}
                      title={isViewer ? "Action disabled in Demo Mode" : "Edit Configuration"}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(sensor.id)}
                      disabled={isViewer}
                      className={`p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all ${isViewer ? "opacity-30 cursor-not-allowed" : ""}`}
                      title={isViewer ? "Action disabled in Demo Mode" : "Decommission Node"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sensors.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center opacity-20">
                  <Activity className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em]">Zero Active Hardware Detected</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Control Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/95 backdrop-blur-xl animate-fadeIn p-4 overflow-y-auto custom-scrollbar">
          <div className="industrial-grid-premium fixed inset-0 opacity-[0.05] pointer-events-none" />

          <div className="w-full max-w-xl my-8 p-8 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10 bg-industrial-950/80 card-premium relative">
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-[14px] font-black text-white uppercase tracking-[0.4em]">{editingSensor ? "Ammend Node_ID" : "Provision New Node"}</h3>
                <p className="text-[9px] text-industrial-500 uppercase tracking-widest mt-1 italic">Registry_Protocol_v2.4</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-industrial-600 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-industrial-600 uppercase tracking-widest mb-2 block group-focus-within:text-brand-main transition-colors">Target Node ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSensor}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none transition-all font-mono text-[11px] tracking-widest uppercase bg-industrial-950 border-white/5 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 ${editingSensor ? "opacity-30 cursor-not-allowed" : ""}`}
                    placeholder="e.g. SENSOR_OPER_X"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-industrial-600 uppercase tracking-widest mb-2 block group-focus-within:text-brand-main transition-colors">Service Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 rounded-xl border outline-none transition-all font-mono text-[11px] tracking-widest uppercase bg-industrial-950 border-white/5 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20"
                    placeholder="e.g. CORE_TEMP_FLUX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-[10px] font-black text-industrial-600 uppercase tracking-widest mb-2 block">System Class</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-4 rounded-xl border outline-none transition-all text-[11px] font-black uppercase tracking-widest bg-industrial-950 border-white/5 focus:border-brand-main/40"
                    >
                      <option value="temperature">TEMP_FLUX</option>
                      <option value="humidity">HUMID_FLUX</option>
                      <option value="pressure">PRESS_ATM</option>
                      <option value="pressure">PRES_VECT</option>
                      <option value="vibration">VIBE_OSC</option>
                      <option value="power">PWR_LOAD</option>
                      <option value="relay">RELAY_ACT</option>
                      <option value="generic">GEN_NODE</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-industrial-600 uppercase tracking-widest mb-2 block">Metric Scale</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full p-4 rounded-xl border outline-none transition-all font-mono text-[11px] uppercase bg-industrial-950 border-white/5 focus:border-brand-main/40"
                      placeholder="e.g. °C, bar, A"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-industrial-600 uppercase tracking-widest mb-2 block group-focus-within:text-brand-main transition-colors">Deviation Threshold</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                    className="w-full p-4 rounded-xl border outline-none transition-all font-mono text-[12px] font-black text-brand-main bg-industrial-950 border-white/5 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-industrial-600 hover:text-white transition-all">
                  ABORT_CMD
                </button>
                <button type="submit" className="btn-premium px-10 py-4 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 group/btn">
                  <Save size={16} className="group-hover/btn:scale-110 transition-transform" />
                  COMMIT_REGISTRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorManager;
