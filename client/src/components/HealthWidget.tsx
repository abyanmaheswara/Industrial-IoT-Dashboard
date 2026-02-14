import React from 'react';
import { AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import type { SensorData } from '../types/sensor';

interface HealthWidgetProps {
    sensors: SensorData[];
    aiEnabled: boolean;
}

export const HealthWidget: React.FC<HealthWidgetProps> = ({ sensors, aiEnabled }) => {
    // Calculate Average System Health
    const totalHealth = sensors.reduce((acc, s) => acc + (s.health || 100), 0);
    const avgHealth = Math.round(totalHealth / (sensors.length || 1));

    // Find Anomalies
    const anomalies = sensors.filter(s => s.isAnomaly);

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-industrial-50 dark:bg-industrial-800 p-6 rounded-lg shadow-lg border border-industrial-200 dark:border-industrial-700 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-industrial-900 dark:text-gray-100 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    AI System Insights
                </h3>
                {aiEnabled && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full border border-purple-200 dark:border-purple-500/30">
                        Active
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Score */}
                <div className="flex flex-col items-center justify-center p-4 bg-industrial-100 dark:bg-industrial-900/50 rounded-lg transition-colors">
                    <span className="text-industrial-600 dark:text-industrial-400 text-sm mb-2">Overall Machine Health</span>
                    <div className={`text-5xl font-bold ${getHealthColor(avgHealth)}`}>
                        {avgHealth}%
                    </div>
                    <div className="mt-2 text-xs text-center text-industrial-500 dark:text-industrial-500">
                        Based on utilization & alerts
                    </div>
                </div>

                {/* Anomaly Monitor */}
                <div className="flex flex-col gap-3">
                    <div className="text-sm text-industrial-600 dark:text-industrial-400 mb-1">Detected Anomalies (Real-time)</div>
                    
                    {anomalies.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm transition-colors">
                            <CheckCircle size={16} />
                            <span>System operating normally.</span>
                        </div>
                    ) : (
                        anomalies.map(sensor => (
                            <div key={sensor.id} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm animate-pulse transition-colors">
                                <AlertTriangle size={16} />
                                <span>
                                    <strong>{sensor.name}</strong>: Suspicious spike detected! (Z-Score: {sensor.zScore})
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
