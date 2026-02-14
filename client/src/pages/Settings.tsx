import { ProfileSection } from '../components/Settings/ProfileSection';
import { SystemConfigSection } from '../components/Settings/SystemConfigSection';
import { NotificationsSection } from '../components/Settings/NotificationsSection';
import SensorManager from '../components/SensorManager';

export function Settings() {
  return (
    <div className="p-6 min-h-screen bg-industrial-50 dark:bg-industrial-950">
      <h1 className="text-2xl font-bold mb-2 text-industrial-900 dark:text-white">Settings</h1>
      <p className="text-industrial-600 dark:text-industrial-400 mb-6">
        Manage system configuration and preferences
      </p>

      {/* User Profile */}
      <ProfileSection />
      
      {/* Sensor Management */}
      <div className="mb-6">
        <SensorManager />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <SystemConfigSection />

        {/* Notifications */}
        <NotificationsSection />
      </div>
    </div>
  );
}
