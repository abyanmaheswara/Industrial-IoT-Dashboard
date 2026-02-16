import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2 } from 'lucide-react';

export const SensorConfig: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSensor, setEditingSensor] = useState<any>(null);
    const [sensors, setSensors] = useState<any[]>([]);
    const [formData, setFormData] = useState({ id: '', name: '', type: 'temperature', unit: '°C', threshold: '50' });

    // Fetch sensors from API
    const fetchSensors = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/sensors');
            const data = await res.json();
            setSensors(data);
        } catch (err) {
            console.error("Failed to fetch sensors", err);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sensor?')) return;
        try {
            await fetch(`http://localhost:3001/api/sensors/${id}`, { method: 'DELETE' });
            fetchSensors();
        } catch (err) {
            alert('Failed to delete sensor');
        }
    };

    const handleToggleStatus = async (sensor: any) => {
        const newStatus = sensor.status === 'active' ? 'disabled' : 'active';
        try {
            await fetch(`http://localhost:3001/api/sensors/${sensor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchSensors();
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const handleEdit = (sensor: any) => {
        setEditingSensor(sensor);
        setFormData({
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
            unit: sensor.unit,
            threshold: sensor.threshold
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingSensor(null);
        setFormData({ id: '', name: '', type: 'temperature', unit: '°C', threshold: '50' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingSensor 
                ? `http://localhost:3001/api/sensors/${editingSensor.id}`
                : 'http://localhost:3001/api/sensors';
            
            const method = editingSensor ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save');
            
            setIsModalOpen(false);
            fetchSensors();
        } catch (err) {
            alert('Error saving sensor');
            console.error(err);
        }
    };

    return (
        <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sensor Management</h3>
                    <p className="text-sm text-industrial-400 mt-1">Configure and monitor your IoT sensors</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-150 shadow-[0_0_15px_rgba(168,121,50,0.2)] border border-brand-500/20"
                >
                    <Plus size={18} />
                    <span>Add Sensor</span>
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-industrial-800 bg-black/20">
                            <th className="px-6 py-4 text-left text-xs font-bold text-industrial-400 uppercase tracking-widest">Sensor ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-industrial-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-industrial-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-industrial-400 uppercase tracking-widest">Threshold</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-industrial-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-industrial-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-industrial-800">
                        {sensors.map(sensor => (
                            <tr key={sensor.id} className="hover:bg-brand-500/5 transition-all duration-150 border-b border-industrial-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(168,121,50,0.5)]"></div>
                                        <span className="text-sm font-mono text-industrial-400">{sensor.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-white tracking-wide">{sensor.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-brand-900/40 text-brand-400 border border-brand-500/30 uppercase tracking-tighter">
                                        {sensor.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-industrial-300">
                                        <span className="font-black text-brand-500">{sensor.threshold}</span>
                                        <span className="text-industrial-500 ml-1 font-mono text-xs">{sensor.unit}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {sensor.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-950/30 text-green-500 border border-green-500/30 uppercase tracking-tighter">
                                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-industrial-800 text-industrial-500 border border-industrial-700 uppercase tracking-tighter">
                                            <span className="w-1 h-1 bg-industrial-600 rounded-full"></span>
                                            Disabled
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleToggleStatus(sensor)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-150 border ${
                                                sensor.status === 'active' 
                                                    ? 'bg-industrial-950/50 hover:bg-brand-500/5 text-brand-700 border-industrial-800' 
                                                    : 'bg-green-950/30 hover:bg-green-500/10 text-green-500 border-green-500/30'
                                            }`}
                                            title={sensor.status === 'active' ? 'Disable' : 'Enable'}
                                        >
                                            {sensor.status === 'active' ? 'Disable' : 'Enable'}
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(sensor)}
                                            className="p-2 text-brand-700 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-all duration-150" 
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sensor.id)}
                                            className="p-2 text-brand-700 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-150" 
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 pt-4 border-t border-industrial-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-industrial-500 uppercase tracking-widest">Data Retention:</span>
                        <span className="px-2 py-1 bg-brand-900/40 text-brand-500 text-xs font-bold rounded border border-brand-500/30">30 DAYS</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-950/30 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-500/30 transition-all">
                        <Trash2 size={16} />
                        Clear Historical Data
                    </button>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-industrial-900 border border-brand-500/20 rounded-xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest text-center">{editingSensor ? 'Update Sensor' : 'Register Sensor'}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-industrial-300 mb-1">Sensor ID</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white disabled:opacity-50"
                                    value={formData.id}
                                    onChange={e => setFormData({...formData, id: e.target.value})}
                                    disabled={!!editingSensor}
                                    required
                                    placeholder="e.g., temp_02"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-industrial-300 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="e.g., Boiler Temperature"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-industrial-300 mb-1">Type</label>
                                    <select 
                                        className="w-full bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="temperature">Temperature</option>
                                        <option value="pressure">Pressure</option>
                                        <option value="vibration">Vibration</option>
                                        <option value="power">Power</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-industrial-300 mb-1">Unit</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white"
                                        value={formData.unit}
                                        onChange={e => setFormData({...formData, unit: e.target.value})}
                                        placeholder="°C"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-industrial-300 mb-1">Alert Threshold</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-industrial-950 border border-industrial-800 rounded px-3 py-2 text-white"
                                    value={formData.threshold}
                                    onChange={e => setFormData({...formData, threshold: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-industrial-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-2 bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(168,121,50,0.2)] border border-brand-500/20"
                                >
                                    {editingSensor ? 'Update' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
