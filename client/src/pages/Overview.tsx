import React from 'react';
import type { SensorData } from '../types/sensor';
import { SensorWidget } from '../components/SensorWidget';
// import { HistoryChart } from '../components/HistoryChart'; // Keep for other pages if needed, or remove if unused locally
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HealthWidget } from '../components/HealthWidget';

interface OverviewProps {
  sensorData: SensorData[];
  powerHistory: SensorData[];
}

export const Overview: React.FC<OverviewProps> = ({ sensorData, powerHistory }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* AI Health Section */}
      <div className="mb-8">
        <HealthWidget sensors={sensorData} aiEnabled={true} />
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sensorData.map(sensor => (
          <SensorWidget key={sensor.id} data={sensor} />
        ))}
        {sensorData.length === 0 && (
          // Skeletons for loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-industrial-800/50"></div>
          ))
        )}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-industrial-50 dark:bg-industrial-800 rounded-lg p-6 border border-industrial-200 dark:border-industrial-700">
          <h2 className="text-xl font-bold mb-4 text-industrial-900 dark:text-white">
            Power Trend (kW)
          </h2>
          {powerHistory.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={200}>
                  <LineChart data={powerHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(timestamp: any) => {
                          try {
                             // If timestamp is already formatted string (from user snippet logic), use it. 
                             // If it is number (from my App.tsx logic), format it.
                             // My App.tsx sends 'timestamp' as number.
                             // User snippet expected 'timestamp' as string.
                             // I will format it here to be safe.
                             if (typeof timestamp === 'number') {
                                 return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                             }
                             return timestamp;
                          } catch (e) { return ""; }
                      }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-industrial-500 dark:text-industrial-400">
              Waiting for data history...
            </div>
          )}
        </div>
        
        {/* Recent Alerts Panel */}
        <div className="bg-industrial-50 dark:bg-industrial-800 rounded-lg p-6 border border-industrial-200 dark:border-industrial-700 lg:col-span-1">
          <h3 className="text-lg font-medium text-industrial-900 dark:text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {sensorData.filter(s => s.status !== 'normal').length === 0 ? (
                <div className="text-industrial-400 text-sm flex flex-col items-center justify-center h-40">
                  <span className="text-industrial-500 mb-2">No active alerts</span>
                  <span className="text-xs">System operating normally</span>
                </div>
              ) : (
                sensorData.filter(s => s.status !== 'normal').map(sensor => (
                  <div key={sensor.id} className={`p-3 rounded border-l-4 ${
                    sensor.status === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-yellow-50 dark:bg-amber-900/20 border-amber-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-industrial-900 dark:text-industrial-100 text-sm">{sensor.name}</span>
                      <span className="text-xs text-industrial-500 dark:text-industrial-400">{new Date(sensor.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className={sensor.status === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                        {sensor.status.toUpperCase()}: {sensor.value} {sensor.unit}
                      </span>
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
