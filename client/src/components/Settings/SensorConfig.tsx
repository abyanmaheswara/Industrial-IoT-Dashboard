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
            <div className="flex justify-between items-center mb-4 border-b border-industrial-800 pb-2">
                <h3 className="text-lg font-medium text-white">Sensor Management</h3>
                <button 
                    onClick={handleAdd}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                >
                    <Plus size={16} />
                    <span>Add Sensor</span>
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead className="bg-industrial-900 text-industrial-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Threshold</th>
                             <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-industrial-800">
                        {sensors.map(sensor => (
                            <tr key={sensor.id} className="hover:bg-industrial-900/50">
                                <td className="px-4 py-3 text-sm text-industrial-500 font-mono">{sensor.id}</td>
                                <td className="px-4 py-3 text-sm font-medium text-white">{sensor.name}</td>
                                <td className="px-4 py-3 text-sm text-industrial-300 capitalize">{sensor.type}</td>
                                <td className="px-4 py-3 text-sm text-industrial-300">{sensor.threshold} {sensor.unit}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        sensor.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-industrial-700 text-industrial-400'
                                    }`}>
                                        {sensor.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button 
                                            onClick={() => handleToggleStatus(sensor)}
                                            className={`p-1 ${sensor.status === 'active' ? 'text-green-500 hover:text-green-400' : 'text-industrial-500 hover:text-industrial-400'}`}
                                            title={sensor.status === 'active' ? 'Disable' : 'Enable'}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(sensor)}
                                            className="p-1 text-industrial-400 hover:text-white" 
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sensor.id)}
                                            className="p-1 text-industrial-400 hover:text-red-400" 
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
            
            <div className="mt-4 pt-4 border-t border-industrial-800">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-industrial-400">Data Retention Policy: <span className="text-white font-medium">30 Days</span></span>
                    <button className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 bg-red-500/10 px-3 py-1 rounded">
                        Clear Historical Data
                    </button>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-industrial-900 border border-industrial-700 rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">{editingSensor ? 'Edit Sensor' : 'Add New Sensor'}</h2>
                        
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

                            <div className="flex justify-end space-x-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-industrial-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                                >
                                    {editingSensor ? 'Update Sensor' : 'Create Sensor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
