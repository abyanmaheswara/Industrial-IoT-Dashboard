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
      const res = await fetch('http://localhost:3001/api/sensors');
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
      const res = await fetch(`http://localhost:3001/api/sensors/${sensor.id}`, {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-industrial-900 border border-industrial-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-industrial-800 bg-industrial-800/50">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-brand-900/30 rounded-lg border border-brand-500/30">
                <AlertTriangle className="text-brand-400" size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Configure Alert Rules</h2>
                <p className="text-sm text-industrial-400">Define operational thresholds for sensors</p>
             </div>
          </div>
          <button onClick={onClose} className="text-industrial-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-industrial-400">Loading configurations...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-industrial-400 text-sm border-b border-industrial-800">
                  <th className="py-3 font-medium">Sensor Name</th>
                  <th className="py-3 font-medium">Min Value</th>
                  <th className="py-3 font-medium">Max Value</th>
                  <th className="py-3 font-medium text-yellow-500">Threshold (Critical)</th>
                  <th className="py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800">
                {sensors.map(sensor => (
                  <tr key={sensor.id} className="group hover:bg-industrial-800/30 transition-colors">
                    <td className="py-4 text-white font-medium">
                        {sensor.name}
                        <div className="text-xs text-industrial-500 font-normal">{sensor.id}</div>
                    </td>
                    <td className="py-4">
                        <input 
                            type="number" 
                            className="bg-industrial-950 border border-industrial-700 rounded px-2 py-1 w-24 text-white text-sm focus:border-brand-500 focus:outline-none"
                            value={sensor.min}
                            onChange={(e) => handleChange(sensor.id, 'min', e.target.value)}
                        />
                    </td>
                    <td className="py-4">
                         <input 
                            type="number" 
                            className="bg-industrial-950 border border-industrial-700 rounded px-2 py-1 w-24 text-white text-sm focus:border-brand-500 focus:outline-none"
                            value={sensor.max}
                            onChange={(e) => handleChange(sensor.id, 'max', e.target.value)}
                        />
                    </td>
                    <td className="py-4">
                         <input 
                            type="number" 
                            className="bg-industrial-950 border border-industrial-700 rounded px-2 py-1 w-24 text-yellow-500 font-bold text-sm focus:border-yellow-500 focus:outline-none"
                            value={sensor.threshold}
                            onChange={(e) => handleChange(sensor.id, 'threshold', e.target.value)}
                        />
                    </td>
                    <td className="py-4 text-right">
                        <button 
                            onClick={() => handleSave(sensor)}
                            className="text-brand-400 hover:text-brand-300 p-2 hover:bg-brand-900/20 rounded-full transition-colors"
                            title="Save Changes"
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
        <div className="p-4 border-t border-industrial-800 bg-industrial-900 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-industrial-800 text-white rounded hover:bg-industrial-700 transition"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
