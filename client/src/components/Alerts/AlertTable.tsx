import React, { useState, useEffect } from 'react';
import { CheckCircle, Eye } from 'lucide-react';

interface AlertTableProps {
    alerts: any[];
    onRefresh: () => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, onRefresh }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to page 1 when alerts change
    useEffect(() => {
        setCurrentPage(1);
    }, [alerts]);

    // Calculate pagination
    const totalPages = Math.ceil(alerts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAlerts = alerts.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

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
                    <thead className="bg-gray-100 dark:bg-industrial-900 text-gray-700 dark:text-industrial-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 tracking-wider">Sensor</th>
                            <th className="px-6 py-3 tracking-wider">Severity</th>
                            <th className="px-6 py-3 tracking-wider">Message</th>
                            <th className="px-6 py-3 tracking-wider">Status</th>
                            <th className="px-6 py-3 tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-industrial-800">
                        {currentAlerts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-industrial-400">
                                    No alerts found
                                </td>
                            </tr>
                        ) : (
                            currentAlerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(alert.created_at).toLocaleTimeString()} <span className="text-gray-500 dark:text-industrial-500 text-xs ml-1">{new Date(alert.created_at).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {alert.sensor_name || alert.sensor_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            alert.type === 'critical' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                                        }`}>
                                            {alert.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-industrial-300">
                                        {alert.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            alert.status === 'active' ? 'bg-red-500 text-white animate-pulse' : 
                                            alert.status === 'acknowledged' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
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
                                                            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-industrial-400 transition-colors" 
                                                            title="Acknowledge"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleAction(alert.id, 'resolve')}
                                                        className="p-1 hover:text-green-600 dark:hover:text-green-400 text-gray-600 dark:text-industrial-400 transition-colors" 
                                                        title="Resolve"
                                                    >
                                                        <span className="text-xs border border-current px-1 rounded">Resolve</span>
                                                    </button>
                                                </>
                                            )}
                                            {alert.status === 'resolved' && (
                                                 <Eye size={18} className="text-gray-400 dark:text-industrial-600" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 dark:bg-industrial-900 px-6 py-3 border-t border-gray-200 dark:border-industrial-800 flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-industrial-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, alerts.length)} of {alerts.length} entries
                </span>
                <div className="flex space-x-1">
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-2 py-1 border border-gray-300 dark:border-industrial-700 rounded text-xs text-gray-700 dark:text-industrial-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-industrial-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <button 
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                    currentPage === pageNum 
                                        ? 'bg-blue-600 text-white' 
                                        : 'border border-gray-300 dark:border-industrial-700 text-gray-700 dark:text-industrial-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-industrial-800'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-2 py-1 border border-gray-300 dark:border-industrial-700 rounded text-xs text-gray-700 dark:text-industrial-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-industrial-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
