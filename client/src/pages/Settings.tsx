import { useTheme } from '../context/ThemeContext';

export function Settings() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log('🖱️ Button clicked! Changing theme to:', newTheme); // DEBUG
    setTheme(newTheme);
  };

  console.log('⚙️ Settings rendered. Current theme:', theme); // DEBUG

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage system configuration and preferences
      </p>

      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          User Profile
        </h2>
        
        <div className="flex items-start gap-6">
          {/* Avatar with Photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-brown to-brand-500">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          
          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                defaultValue="admin"
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                User ID
              </label>
              <input
                type="text"
                defaultValue="USER-1"
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                type="text"
                defaultValue="Admin"
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Department
              </label>
              <input
                type="text"
                defaultValue="General Operations"
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-brand-brown to-brand-500 hover:from-brand-brown-dark hover:to-brand-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            System Configuration
          </h2>

          {/* Theme Preference */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Theme Preference
            </label>
            <div className="grid grid-cols-3 gap-4">
              {/* Light Theme Button */}
              <button
                onClick={() => handleThemeChange('light')}
                type="button"
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'light'
                    ? 'border-brand-500 bg-gradient-to-br from-brand-100 to-brand-200 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className={`w-6 h-6 ${theme === 'light' ? 'text-brand-600' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'}`}>
                    Light
                  </span>
                </div>
              </button>

              {/* Dark Theme Button */}
              <button
                onClick={() => handleThemeChange('dark')}
                type="button"
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-brand-500 bg-gradient-to-br from-brand-900 to-brand-800 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-brand-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-brand-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Dark
                  </span>
                </div>
              </button>

              {/* System Theme Button */}
              <button
                onClick={() => handleThemeChange('system')}
                type="button"
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'system'
                    ? 'border-brand-500 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className={`w-6 h-6 ${theme === 'system' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-medium ${theme === 'system' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    System
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Refresh Interval & Temperature Unit */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Refresh Interval
              </label>
              <select className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option>5 Seconds</option>
                <option>10 Seconds</option>
                <option>30 Seconds</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Temperature Unit
              </label>
              <select className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option>Celsius (°C)</option>
                <option>Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Time Zone
            </label>
            <select className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
              <option>UTC+00:00 Coordinated Universal Time</option>
              <option>UTC+07:00 Jakarta</option>
              <option>UTC+08:00 Singapore</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-brown to-brand-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    In-App Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Show popups when dashboard is open
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Sound Alerts
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Play sound on critical alerts
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
