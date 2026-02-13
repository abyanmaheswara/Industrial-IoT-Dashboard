import React from 'react';
import { MoreVertical, CheckCircle, Eye } from 'lucide-react';

const MOCK_ALERTS = [
    { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), sensor: 'Pressure Main', type: 'Critical', message: 'Pressure exceeded safe limit (9.2 bar)', status: 'Active' },
    { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), sensor: 'Vibration Motor', type: 'Warning', message: 'High vibration detected (11.5 mm/s)', status: 'Acknowledged' },
    { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), sensor: 'Temp Unit B', type: 'Warning', message: 'Temperature rising fast', status: 'Resolved' },
    { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), sensor: 'Power Unit 1', type: 'Critical', message: 'Power surge detected', status: 'Resolved' },
    { id: 5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), sensor: 'Hydraulic Pump', type: 'Warning', message: 'Oil level low', status: 'Resolved' },
];

export const AlertTable: React.FC = () => {
    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-industrial-900 text-industrial-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 tracking-wider">Sensor</th>
                            <th className="px-6 py-3 tracking-wider">Severity</th>
                            <th className="px-6 py-3 tracking-wider">Message</th>
                            <th className="px-6 py-3 tracking-wider">Status</th>
                            <th className="px-6 py-3 tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-industrial-800">
                        {MOCK_ALERTS.map((alert) => (
                            <tr key={alert.id} className="hover:bg-industrial-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-industrial-300">
                                    {new Date(alert.timestamp).toLocaleTimeString()} <span className="text-industrial-500 text-xs ml-1">{new Date(alert.timestamp).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {alert.sensor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.type === 'Critical' ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 'bg-amber-900/50 text-amber-400 border border-amber-500/30'
                                    }`}>
                                        {alert.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-industrial-300">
                                    {alert.message}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.status === 'Active' ? 'bg-red-500 text-white animate-pulse' : 
                                        alert.status === 'Acknowledged' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'
                                    }`}>
                                        {alert.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="p-1 hover:text-white text-industrial-400 transition-colors" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-1 hover:text-blue-400 text-industrial-400 transition-colors" title="Acknowledge">
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-industrial-900 px-6 py-3 border-t border-industrial-800 flex items-center justify-between">
                <span className="text-xs text-industrial-400">Showing 1 to 5 of 24 entries</span>
                <div className="flex space-x-1">
                    <button className="px-2 py-1 border border-industrial-700 rounded text-xs text-industrial-400 hover:text-white hover:bg-industrial-800 disabled:opacity-50">Prev</button>
                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                    <button className="px-2 py-1 border border-industrial-700 rounded text-xs text-industrial-400 hover:text-white hover:bg-industrial-800">2</button>
                    <button className="px-2 py-1 border border-industrial-700 rounded text-xs text-industrial-400 hover:text-white hover:bg-industrial-800">Next</button>
                </div>
            </div>
        </div>
    )
}
