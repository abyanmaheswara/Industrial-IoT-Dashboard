import { useTheme } from '../context/ThemeContext';
import { ProfileSection } from '../components/Settings/ProfileSection';
import { SystemConfig } from '../components/Settings/SystemConfig';
import { SensorConfig } from '../components/Settings/SensorConfig';

export function Settings() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log('Changing theme to:', newTheme); // DEBUG
    setTheme(newTheme);
  };

  // Debug current state
  console.log('Current theme:', theme, 'Effective:', effectiveTheme); // DEBUG

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage system configuration and preferences
      </p>

      {/* User Profile Section */}
      <ProfileSection />

      {/* System Configuration and Sensor Management */}
      <SystemConfig />
      <SensorConfig />
    </div>
  );
}


