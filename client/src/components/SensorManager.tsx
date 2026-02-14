import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Sensor {
  id: string;
  name: string;
  type: string;
  unit: string;
  threshold: number;
  status?: string;
}

const SensorManager: React.FC = () => {
  const { theme } = useTheme();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'generic',
    unit: '',
    threshold: 80
  });

  const fetchSensors = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sensors', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
        threshold: sensor.threshold
      });
    } else {
      setEditingSensor(null);
      setFormData({
        id: '',
        name: '',
        type: 'generic',
        unit: '',
        threshold: 80
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sensor? Data collection will stop.')) return;
    
    try {
      await fetch(`http://localhost:3001/api/sensors/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchSensors();
    } catch (err) {
      alert('Failed to delete sensor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSensor) {
        // Update
        await fetch(`http://localhost:3001/api/sensors/${editingSensor.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create
        await fetch('http://localhost:3001/api/sensors', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchSensors();
    } catch (err) {
      alert('Failed to save sensor');
    }
  };

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-md ${
      theme === 'dark' 
        ? 'bg-industrial-800/50 border-industrial-700 text-white' 
        : 'bg-white/80 border-gray-200 text-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-500" />
            Sensor Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-industrial-400' : 'text-gray-500'}`}>
            Manage active sensors and thresholds
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sensor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading sensors...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-industrial-700 text-industrial-400' : 'border-gray-200 text-gray-500'}`}>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Threshold</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map(sensor => (
                <tr key={sensor.id} className={`border-b ${theme === 'dark' ? 'border-industrial-700/50 hover:bg-industrial-700/30' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <td className="p-3 font-mono text-sm opacity-80">{sensor.id}</td>
                   <td className="p-3 font-medium">{sensor.name}</td>
                  <td className="p-3 capitalize opacity-80">{sensor.type}</td>
                  <td className="p-3 opacity-80">{sensor.unit}</td>
                  <td className="p-3 font-mono text-brand-500">{sensor.threshold}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(sensor)}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-industrial-600 text-industrial-300' : 'hover:bg-gray-200 text-gray-600'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sensor.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sensors.length === 0 && (
                <tr>
                   <td colSpan={6} className="p-8 text-center opacity-50">No sensors configuration found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${
            theme === 'dark' 
              ? 'bg-industrial-900 border-brand-500/30 text-white' 
              : 'bg-white border-gray-200 text-gray-800'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">
                {editingSensor ? 'Edit Sensor' : 'Add New Sensor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Sensor ID (MQTT Topic)</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingSensor}
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  className={`w-full p-3 rounded-lg border outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-industrial-950 border-industrial-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500' 
                      : 'bg-gray-50 border-gray-300 focus:border-brand-500'
                  } ${editingSensor ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="e.g. temp_machine_01"
                />
                 {!editingSensor && <p className="text-xs text-brand-500/80 mt-1">Cannot be changed after creation.</p>}
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider opacity-70 mb-1">DisplayName</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-3 rounded-lg border outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-industrial-950 border-industrial-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500' 
                      : 'bg-gray-50 border-gray-300 focus:border-brand-500'
                  }`}
                  placeholder="e.g. Main Boiler Temp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className={`w-full p-3 rounded-lg border outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-industrial-950 border-industrial-700 focus:border-brand-500' 
                          : 'bg-gray-50 border-gray-300 focus:border-brand-500'
                      }`}
                    >
                        <option value="temperature">Temperature</option>
                        <option value="humidity">Humidity</option>
                        <option value="pressure">Pressure</option>
                        <option value="vibration">Vibration</option>
                        <option value="power">Power</option>
                        <option value="generic">Generic</option>
                    </select>
                </div>
                <div>
                     <label className="block text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Unit</label>
                    <input 
                      type="text" 
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      className={`w-full p-3 rounded-lg border outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-industrial-950 border-industrial-700 focus:border-brand-500' 
                          : 'bg-gray-50 border-gray-300 focus:border-brand-500'
                      }`}
                      placeholder="e.g. °C, bar, A"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Warning Threshold</label>
                <input 
                  type="number" 
                  required
                  step="0.1"
                  value={formData.threshold}
                  onChange={e => setFormData({...formData, threshold: parseFloat(e.target.value)})}
                  className={`w-full p-3 rounded-lg border outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-industrial-950 border-industrial-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500' 
                      : 'bg-gray-50 border-gray-300 focus:border-brand-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-lg font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Sensor
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
