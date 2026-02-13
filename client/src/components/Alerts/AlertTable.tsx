import React from 'react';
import { CheckCircle, Eye } from 'lucide-react';

interface AlertTableProps {
    alerts: any[];
    onRefresh: () => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, onRefresh }) => {

    const handleAction = async (id: number, action: 'acknowledge' | 'resolve') => {
        try {
            const status = action === 'acknowledge' ? 'acknowledged' : 'resolved';
            await fetch(`http://localhost:3001/api/alerts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            onRefresh();
        } catch (err) {
            console.error("Failed to update alert:", err);
        }
    };

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
                        {alerts.map((alert) => (
                            <tr key={alert.id} className="hover:bg-industrial-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-industrial-300">
                                    {new Date(alert.created_at).toLocaleTimeString()} <span className="text-industrial-500 text-xs ml-1">{new Date(alert.created_at).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {alert.sensor_name || alert.sensor_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.type === 'critical' ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 'bg-amber-900/50 text-amber-400 border border-amber-500/30'
                                    }`}>
                                        {alert.type.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-industrial-300">
                                    {alert.message}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        alert.status === 'active' ? 'bg-red-500 text-white animate-pulse' : 
                                        alert.status === 'acknowledged' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'
                                    }`}>
                                        {alert.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {alert.status !== 'resolved' && (
                                            <>
                                                {alert.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleAction(alert.id, 'acknowledge')}
                                                        className="p-1 hover:text-blue-400 text-industrial-400 transition-colors" 
                                                        title="Acknowledge"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleAction(alert.id, 'resolve')}
                                                    className="p-1 hover:text-green-400 text-industrial-400 transition-colors" 
                                                    title="Resolve"
                                                >
                                                    <span className="text-xs border border-current px-1 rounded">Resolve</span>
                                                </button>
                                            </>
                                        )}
                                        {alert.status === 'resolved' && (
                                             <Eye size={18} className="text-industrial-600" />
                                        )}
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
