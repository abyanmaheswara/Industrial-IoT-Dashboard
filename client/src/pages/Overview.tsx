import React from 'react';
import type { SensorData } from '../types/sensor';
import { SensorWidget } from '../components/SensorWidget';
import { HistoryChart } from '../components/HistoryChart';

interface OverviewProps {
  sensorData: SensorData[];
  powerHistory: SensorData[];
}

export const Overview: React.FC<OverviewProps> = ({ sensorData, powerHistory }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
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
        <div className="lg:col-span-2">
          <div className="card p-6 min-h-[300px] flex flex-col">
              <h3 className="text-lg font-medium text-white mb-4">Power Trend (kW)</h3>
              <div className="flex-1 w-full min-h-[250px]">
                <HistoryChart data={powerHistory} color="#f59e0b" />
              </div>
          </div>
        </div>
        
        {/* Recent Alerts Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 h-full">
            <h3 className="text-lg font-medium text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {sensorData.filter(s => s.status !== 'normal').length === 0 ? (
                <div className="text-industrial-400 text-sm flex flex-col items-center justify-center h-40">
                  <span className="text-industrial-600 mb-2">No active alerts</span>
                  <span className="text-xs">System operating normally</span>
                </div>
              ) : (
                sensorData.filter(s => s.status !== 'normal').map(sensor => (
                  <div key={sensor.id} className={`p-3 rounded border-l-4 ${
                    sensor.status === 'critical' ? 'bg-red-900/20 border-red-500' : 'bg-amber-900/20 border-amber-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-white text-sm">{sensor.name}</span>
                      <span className="text-xs text-industrial-400">{new Date(sensor.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className={sensor.status === 'critical' ? 'text-red-400' : 'text-amber-400'}>
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
    </div>
  );
};
