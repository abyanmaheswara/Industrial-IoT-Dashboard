import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

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
  onSave: () => void; // Callback to refresh data if needed
}

export const RuleConfigModal: React.FC<RuleConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch current configs on mount
  useEffect(() => {
    if (isOpen) {
      fetchSensors();
    }
  }, [isOpen]);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/sensors`);
      const data = await res.json();
      setSensors(data);
    } catch (err) {
      setError('Failed to load sensor configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof SensorConfig, value: string) => {
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: parseFloat(value) } : s
    ));
  };

  const handleSave = async (sensor: SensorConfig) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/sensors/${sensor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensor)
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      alert(`Updated rules for ${sensor.name}`);
      onSave();
    } catch (err) {
      alert('Error updating rule');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
      <div className="bg-industrial-900 border border-brand-500/20 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.02] to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-industrial-800 bg-industrial-800/30 relative z-10">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-brand-900/40 rounded-lg border border-brand-500/30">
                <AlertTriangle className="text-brand-500" size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Configure Alert Rules</h2>
                <p className="text-sm text-industrial-400">Define operational thresholds for sensors</p>
             </div>
          </div>
          <button onClick={onClose} className="text-brand-700 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 relative z-10">
          {loading ? (
            <div className="text-center py-10 text-industrial-500">Loading configurations...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-industrial-400 text-xs uppercase tracking-widest border-b border-industrial-800">
                  <th className="py-4 font-bold">Sensor</th>
                  <th className="py-4 font-bold">Min</th>
                  <th className="py-4 font-bold">Max</th>
                  <th className="py-4 font-bold text-brand-500">Critical Threshold</th>
                  <th className="py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800">
                {sensors.map(sensor => (
                  <tr key={sensor.id} className="group hover:bg-industrial-800/40 transition-colors">
                    <td className="py-4 text-white font-bold">
                        {sensor.name}
                        <div className="text-[10px] text-industrial-600 font-mono tracking-tighter">{sensor.id.toUpperCase()}</div>
                    </td>
                    <td className="py-4">
                        <input 
                            type="number" 
                            className="bg-industrial-950 border border-industrial-700 rounded px-2 py-1.5 w-20 text-white text-xs focus:border-brand-500 focus:outline-none transition-colors"
                            value={sensor.min}
                            onChange={(e) => handleChange(sensor.id, 'min', e.target.value)}
                        />
                    </td>
                    <td className="py-4">
                         <input 
                            type="number" 
                            className="bg-industrial-950 border border-industrial-700 rounded px-2 py-1.5 w-20 text-white text-xs focus:border-brand-500 focus:outline-none transition-colors"
                            value={sensor.max}
                            onChange={(e) => handleChange(sensor.id, 'max', e.target.value)}
                        />
                    </td>
                    <td className="py-4">
                         <input 
                            type="number" 
                            className="bg-industrial-950 border border-brand-500/20 rounded px-2 py-1.5 w-24 text-brand-500 font-black text-xs focus:border-brand-500 focus:outline-none transition-colors"
                            value={sensor.threshold}
                            onChange={(e) => handleChange(sensor.id, 'threshold', e.target.value)}
                        />
                    </td>
                    <td className="py-4 text-right">
                        <button 
                            onClick={() => handleSave(sensor)}
                            className="text-brand-500 hover:text-brand-300 p-2.5 hover:bg-brand-500/10 rounded-lg transition-all border border-transparent hover:border-brand-500/20"
                            title="Commit Changes"
                        >
                            <Save size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-industrial-800 bg-industrial-950 flex justify-end relative z-10">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-brand-950 hover:bg-brand-500/10 text-brand-100 rounded-lg text-sm font-bold transition-all border border-brand-500/30 shadow-inner"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
