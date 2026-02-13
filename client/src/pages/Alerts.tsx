import React from 'react';
import { AlertStats } from '../components/Alerts/AlertStats';
import { AlertFilters } from '../components/Alerts/AlertFilters';
import { AlertTable } from '../components/Alerts/AlertTable';

export const Alerts: React.FC = () => {
  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts Management</h1>
          <p className="text-industrial-400 text-sm mt-1">Monitor and respond to system alerts</p>
        </div>
        <button className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 text-white rounded-md text-sm font-medium transition-colors border border-industrial-700">
            Configure Rules
        </button>
      </div>

      <AlertStats />
      <AlertFilters />
      <AlertTable />
    </div>
  );
};
