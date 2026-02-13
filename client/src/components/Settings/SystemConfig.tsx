import React, { useState } from 'react';
import { Moon, Sun, Monitor, Volume2, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SystemConfig: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [unit, setUnit] = useState(() => localStorage.getItem('tempUnit') || 'c');
    
    // Notifications state
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        sound: true
    });

    // Theme handling is now managed by Context, we just call setTheme
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme as 'light' | 'dark' | 'system');
    };

    // Persist Unit changes
    const handleUnitChange = (newUnit: string) => {
        setUnit(newUnit);
        localStorage.setItem('tempUnit', newUnit);
        // Dispatch event for other components to listen
        window.dispatchEvent(new Event('unitChange'));
        // Simple brute force update for now to reflect across app
        window.location.reload(); 
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* General Settings */}
            <div className="card p-6">
                <h3 className="text-lg font-medium text-industrial-50 mb-4 border-b border-industrial-800 pb-2">System Configuration</h3>
                
                <div className="space-y-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            Theme Preference
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Light Theme */}
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'light'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Sun className="w-6 h-6" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Light
                                    </span>
                                </div>
                            </button>

                            {/* Dark Theme */}
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'dark'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Moon className="w-6 h-6" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Dark
                                    </span>
                                </div>
                            </button>

                            {/* System Theme */}
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'system'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Monitor className="w-6 h-6" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        System
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-industrial-300 mb-2">Refresh Interval</label>
                            <select className="w-full bg-industrial-900 border border-industrial-800 text-industrial-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500" defaultValue="5">
                                <option value="1">1 Second</option>
                                <option value="2">2 Seconds</option>
                                <option value="5">5 Seconds</option>
                                <option value="10">10 Seconds</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-industrial-300 mb-2">Temperature Unit</label>
                            <select 
                                className="w-full bg-industrial-900 border border-industrial-800 text-industrial-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                value={unit}
                                onChange={(e) => handleUnitChange(e.target.value)}
                            >
                                <option value="c">Celsius (°C)</option>
                                <option value="f">Fahrenheit (°F)</option>
                                <option value="k">Kelvin (K)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-industrial-300 mb-2">Time Zone</label>
                         <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-industrial-100">
                             <Globe size={16} className="mr-2 text-industrial-500" />
                             <select className="bg-transparent w-full focus:outline-none text-sm text-industrial-100" defaultValue="UTC+00:00">
                                 <option value="UTC-08:00">UTC-08:00 Pacific Time</option>
                                 <option value="UTC-05:00">UTC-05:00 Eastern Time</option>
                                 <option value="UTC+00:00">UTC+00:00 Coordinated Universal Time</option>
                                 <option value="UTC+07:00">UTC+07:00 Western Indonesia Time</option>
                             </select>
                         </div>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="card p-6">
                <h3 className="text-lg font-medium text-industrial-50 mb-4 border-b border-industrial-800 pb-2">Notifications</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-industrial-900 rounded border border-industrial-800">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-500/20 text-blue-500 rounded mr-3">
                                <Monitor size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-industrial-100">In-App Notifications</p>
                                <p className="text-xs text-industrial-400">Show popups when dashboard is open</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={notifications.push}
                                onChange={() => setNotifications({...notifications, push: !notifications.push})}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5"
                                style={{ right: notifications.push ? '0' : 'auto', left: notifications.push ? 'auto' : '0' }}
                            />
                            <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${notifications.push ? 'bg-blue-600' : 'bg-industrial-700'}`}></label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-industrial-900 rounded border border-industrial-800">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-500/20 text-purple-500 rounded mr-3">
                                <Volume2 size={18} />
                            </div>
                             <div>
                                <p className="text-sm font-medium text-industrial-100">Sound Alerts</p>
                                <p className="text-xs text-industrial-400">Play sound on critical alerts</p>
                            </div>
                        </div>
                         <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                checked={notifications.sound}
                                onChange={() => setNotifications({...notifications, sound: !notifications.sound})}
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                style={{ right: notifications.sound ? '0' : 'auto', left: notifications.sound ? 'auto' : '0' }}
                            />
                            <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${notifications.sound ? 'bg-blue-600' : 'bg-industrial-700'}`}></label>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-industrial-800 flex justify-end">
                    <button 
                        onClick={() => {
                            if(confirm("Reset all notifications to default?")){
                                setNotifications({ email: true, sms: false, push: true, sound: true });
                            }
                        }}
                        className="text-xs text-industrial-400 hover:text-industrial-100 underline"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    )
}
