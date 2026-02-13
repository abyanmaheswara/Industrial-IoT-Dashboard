import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Trash2, Plus, Edit2 } from 'lucide-react';

const MOCK_SENSORS = [
    { id: 't1', name: 'Temperature A', type: 'Temperature', status: 'Active', baseline: '45°C' },
    { id: 'p1', name: 'Pressure Main', type: 'Pressure', status: 'Active', baseline: '5 Bar' },
    { id: 'v1', name: 'Vibration Motor', type: 'Vibration', status: 'Maintenance', baseline: '2.5 mm/s' },
    { id: 'e1', name: 'Power Unit 1', type: 'Power', status: 'Active', baseline: '75 kW' },
    { id: 't2', name: 'Temperature B', type: 'Temperature', status: 'Disabled', baseline: '42°C' },
];

export const SensorConfig: React.FC = () => {
    return (
        <div className="card p-6">
            <div className="flex justify-between items-center mb-4 border-b border-industrial-800 pb-2">
                <h3 className="text-lg font-medium text-white">Sensor Management</h3>
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors">
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
                            <th className="px-4 py-2">Baseline</th>
                             <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-industrial-800">
                        {MOCK_SENSORS.map(sensor => (
                            <tr key={sensor.id} className="hover:bg-industrial-900/50">
                                <td className="px-4 py-3 text-sm text-industrial-500 font-mono">{sensor.id}</td>
                                <td className="px-4 py-3 text-sm font-medium text-white">{sensor.name}</td>
                                <td className="px-4 py-3 text-sm text-industrial-300">{sensor.type}</td>
                                <td className="px-4 py-3 text-sm text-industrial-300">{sensor.baseline}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        sensor.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                        sensor.status === 'Disabled' ? 'bg-industrial-700/50 text-industrial-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {sensor.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="p-1 text-industrial-400 hover:text-white" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className={`p-1 ${sensor.status === 'Disabled' ? 'text-industrial-600' : 'text-green-500 hover:text-green-400'}`} title="Toggle">
                                            {sensor.status === 'Disabled' ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
                                        </button>
                                        <button className="p-1 text-industrial-400 hover:text-red-400" title="Delete">
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
        </div>
    )
}
