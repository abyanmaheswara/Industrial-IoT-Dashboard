import React from 'react';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface AlertStatsProps {
    stats: {
        critical: number;
        warning: number;
        acknowledged: number;
        avgResponse: string;
    }
}

export const AlertStats: React.FC<AlertStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 flex items-center justify-between bg-red-900/10 border-red-500/30">
                <div>
                   <p className="text-industrial-400 text-xs uppercase font-bold">Critical Alerts</p>
                   <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full text-red-500">
                    <ShieldAlert size={24} />
                </div>
            </div>

             <div className="card p-4 flex items-center justify-between bg-amber-900/10 border-amber-500/30">
                <div>
                   <p className="text-industrial-400 text-xs uppercase font-bold">Warnings</p>
                   <p className="text-2xl font-bold text-amber-500">{stats.warning}</p>
                </div>
                 <div className="p-3 bg-amber-500/20 rounded-full text-amber-500">
                    <AlertTriangle size={24} />
                </div>
            </div>

             <div className="card p-4 flex items-center justify-between">
                <div>
                   <p className="text-industrial-400 text-xs uppercase font-bold">Acknowledged</p>
                   <p className="text-2xl font-bold text-green-400">{stats.acknowledged}</p>
                </div>
                 <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                    <CheckCircle size={24} />
                </div>
            </div>

             <div className="card p-4 flex items-center justify-between">
                 <div>
                   <p className="text-industrial-400 text-xs uppercase font-bold">Avg Response</p>
                   <p className="text-2xl font-bold text-industrial-900 dark:text-white">{stats.avgResponse}</p>
                </div>
                <div className="p-3 bg-industrial-700/50 rounded-full text-industrial-400">
                    <Clock size={24} />
                </div>
            </div>
        </div>
    )
}
