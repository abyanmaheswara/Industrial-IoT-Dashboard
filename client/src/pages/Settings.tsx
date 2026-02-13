import React from 'react';
import { ProfileSection } from '../components/Settings/ProfileSection';
import { SystemConfig } from '../components/Settings/SystemConfig';
import { SensorConfig } from '../components/Settings/SensorConfig';

export const Settings: React.FC = () => {
  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-industrial-400 text-sm mt-1">Manage system configuration and preferences</p>
        </div>
      </div>

      <ProfileSection />
      <SystemConfig />
      <SensorConfig />
    </div>
  );
};
