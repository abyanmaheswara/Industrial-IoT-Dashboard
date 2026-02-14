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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sensor Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure and monitor your IoT sensors</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-brown to-brand-500 hover:from-brand-brown-dark hover:to-brand-600 text-white text-sm font-medium rounded-lg transition-all duration-150 shadow-sm"
                >
                    <Plus size={18} />
                    <span>Add Sensor</span>
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sensor ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Threshold</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sensors.map(sensor => (
                            <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{sensor.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{sensor.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 capitalize">
                                        {sensor.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">{sensor.threshold}</span>
                                        <span className="text-gray-500 dark:text-gray-400 ml-1">{sensor.unit}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {sensor.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Disabled
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleToggleStatus(sensor)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 border ${
                                                sensor.status === 'active' 
                                                    ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700' 
                                                    : 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                            }`}
                                            title={sensor.status === 'active' ? 'Disable' : 'Enable'}
                                        >
                                            {sensor.status === 'active' ? 'Disable' : 'Enable'}
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(sensor)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-all duration-150" 
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(sensor.id)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-150" 
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
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Data Retention:</span>
                        <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-semibold rounded border border-brand-200 dark:border-brand-800">30 Days</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 transition-all duration-150">
                        <Trash2 size={16} />
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
                                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded transition-colors"
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
