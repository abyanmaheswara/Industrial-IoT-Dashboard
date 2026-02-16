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
        <div className="relative group overflow-hidden bg-industrial-950/40 backdrop-blur-xl p-4 rounded-xl border border-brand-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-brand-500/40">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[60px] -mr-10 -mt-10 group-hover:bg-brand-500/20 transition-colors" />
            
            {/* Corner Decorative Elements */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-500/30 rounded-tl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-500/30 rounded-br" />

            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-brand-900/40 border border-brand-500/30 group-hover:border-brand-500/60 transition-colors shadow-[0_0_15px_rgba(168,121,50,0.1)] group-hover:shadow-[0_0_20px_rgba(168,121,50,0.2)]">
                        <Brain className="w-6 h-6 text-brand-400 drop-shadow-[0_0_8px_rgba(168,121,50,0.5)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wider uppercase">
                            AI System <span className="text-brand-500">Insights</span>
                        </h3>
                        <p className="text-[10px] text-brand-700 font-mono uppercase tracking-[0.2em]">Z-Score Neural Engine</p>
                    </div>
                </div>
                {aiEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-950/40 border border-brand-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(168,121,50,0.8)]" />
                        <span className="text-brand-300 text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6 relative z-10">
                {/* Health Score Component */}
                <div className="flex flex-col items-center justify-center p-4 bg-industrial-950/40 border border-brand-900/10 rounded-xl group-hover:border-brand-500/10 transition-colors">
                    <span className="text-industrial-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Core System Integrity</span>
                    <div className="relative">
                        {/* Circular Progress Effect (Subtle) */}
                        <div className={`text-6xl font-black ${getHealthColor(avgHealth)} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                            {avgHealth}<span className="text-2xl ml-1 opacity-50">%</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className={`h-1.5 w-24 bg-industrial-800 rounded-full overflow-hidden`}>
                            <div 
                                className={`h-full transition-all duration-1000 ${avgHealth > 70 ? 'bg-green-500' : avgHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${avgHealth}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Anomaly Monitor Area */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[10px] font-bold text-industrial-400 uppercase tracking-[0.2em]">Neural Anomaly Feed</h4>
                        <span className="text-[9px] text-industrial-600 font-mono">LIVE_STREAM</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                        {anomalies.length === 0 ? (
                            <div className="flex items-center gap-3 p-4 bg-industrial-900/30 border border-green-500/10 rounded-lg text-green-400/80 text-[11px] font-medium leading-relaxed">
                                <div className="p-1.5 rounded bg-green-950/30 text-green-500">
                                    <CheckCircle size={14} />
                                </div>
                                <p>Operational equilibrium maintained. All parameters within nominal range.</p>
                            </div>
                        ) : (
                            anomalies.map(sensor => (
                                <div key={sensor.id} className="flex items-center gap-3 p-4 bg-red-950/10 border border-red-500/20 rounded-lg text-red-300 text-[11px] animate-in fade-in slide-in-from-right-2 duration-500">
                                    <div className="p-1.5 rounded bg-red-900/30 text-red-500 animate-pulse">
                                        <AlertTriangle size={14} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-400 uppercase tracking-wider mb-0.5">{sensor.name}</p>
                                        <p className="opacity-70 leading-relaxed">Statistical deviation detected. Z-Score: <span className="font-mono text-red-400">{sensor.zScore}</span></p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
