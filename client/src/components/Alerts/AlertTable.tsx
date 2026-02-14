import React, { useState, useEffect } from 'react';
import { CheckCircle, Eye, Check, AlertCircle } from 'lucide-react';

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
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-industrial-200 dark:border-industrial-700">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Sensor</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
                        {currentAlerts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-industrial-400 dark:text-industrial-600" />
                                    <p className="text-industrial-500 dark:text-industrial-400 font-medium">No alerts found</p>
                                    <p className="text-sm text-industrial-400 dark:text-industrial-500 mt-1">All systems operating normally</p>
                                </td>
                            </tr>
                        ) : (
                            currentAlerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-industrial-50 dark:hover:bg-industrial-800/40 transition-all duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-industrial-900 dark:text-white">
                                            {new Date(alert.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-industrial-500 dark:text-industrial-400">
                                            {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full mr-2 bg-brand-500"></div>
                                            <span className="text-sm font-semibold text-industrial-900 dark:text-white">
                                                {alert.sensor_name || alert.sensor_id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {alert.type === 'critical' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                CRITICAL
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                                WARNING
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-industrial-700 dark:text-industrial-300 line-clamp-2">
                                            {alert.message}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {alert.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                                Active
                                            </span>
                                        ) : alert.status === 'acknowledged' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                                                <CheckCircle size={12} />
                                                Acknowledged
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                <Check size={12} />
                                                Resolved
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            {alert.status !== 'resolved' && (
                                                <>
                                                    {alert.status === 'active' && (
                                                        <button 
                                                            onClick={() => handleAction(alert.id, 'acknowledge')}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 hover:bg-brand-200 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-400 text-xs font-medium rounded-md transition-all duration-150 border border-brand-200 dark:border-brand-800"
                                                            title="Acknowledge"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Ack
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleAction(alert.id, 'resolve')}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium rounded-md transition-all duration-150 border border-green-200 dark:border-green-800"
                                                        title="Resolve"
                                                    >
                                                        <Check size={14} />
                                                        Resolve
                                                    </button>
                                                </>
                                            )}
                                            {alert.status === 'resolved' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-industrial-400 dark:text-industrial-600 text-xs">
                                                    <Eye size={14} />
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-industrial-50 dark:bg-industrial-900/50 px-6 py-4 border-t border-industrial-200 dark:border-industrial-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-industrial-600 dark:text-industrial-400">
                        Showing <span className="font-semibold text-industrial-900 dark:text-white">{startIndex + 1}</span> to <span className="font-semibold text-industrial-900 dark:text-white">{Math.min(endIndex, alerts.length)}</span> of <span className="font-semibold text-industrial-900 dark:text-white">{alerts.length}</span> alerts
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-industrial-300 dark:border-industrial-700 rounded-md text-sm font-medium text-industrial-700 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                    >
                        Previous
                    </button>
                    <div className="flex gap-1 mx-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button 
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-md text-sm font-medium transition-all duration-150 ${
                                        currentPage === pageNum 
                                            ? 'bg-gradient-to-r from-brand-brown to-brand-500 text-white shadow-sm' 
                                            : 'text-industrial-700 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 border border-industrial-300 dark:border-industrial-700'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 border border-industrial-300 dark:border-industrial-700 rounded-md text-sm font-medium text-industrial-700 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
