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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">System Configuration</h3>
                
                <div className="space-y-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            Theme Preference
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Light Theme */}
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'light'
                                    ? 'border-brand-500 bg-gradient-to-br from-brand-100 to-brand-200 shadow-md'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-brand-600' : 'text-gray-600 dark:text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-brand-700' : 'text-gray-700 dark:text-gray-300'}`}>
                                        Light
                                    </span>
                                </div>
                            </button>

                            {/* Dark Theme */}
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'dark'
                                    ? 'border-brand-500 bg-gradient-to-br from-brand-900 to-brand-800 shadow-md'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-brand-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-brand-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        Dark
                                    </span>
                                </div>
                            </button>

                            {/* System Theme */}
                            <button
                                onClick={() => setTheme('system')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    theme === 'system'
                                    ? 'border-brand-500 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 shadow-md'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-brand-400'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                    <span className={`text-sm font-medium ${theme === 'system' ? 'text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        System
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Refresh Interval</label>
                            <select className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" defaultValue="5">
                                <option value="1">1 Second</option>
                                <option value="2">2 Seconds</option>
                                <option value="5">5 Seconds</option>
                                <option value="10">10 Seconds</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Temperature Unit</label>
                            <select 
                                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                         <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Time Zone</label>
                         <div className="flex items-center px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                             <Globe size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                             <select className="bg-transparent w-full focus:outline-none text-sm text-gray-900 dark:text-white" defaultValue="UTC+00:00">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Notifications</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-brand-brown to-brand-500 rounded-lg">
                                <Monitor size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">In-App Notifications</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Show popups when dashboard is open</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notifications.push}
                                onChange={() => setNotifications({...notifications, push: !notifications.push})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg">
                                <Volume2 size={20} className="text-white" />
                            </div>
                             <div>
                                <p className="font-medium text-gray-900 dark:text-white">Sound Alerts</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Play sound on critical alerts</p>
                            </div>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notifications.sound}
                                onChange={() => setNotifications({...notifications, sound: !notifications.sound})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => {
                            if(confirm("Reset all notifications to default?")){
                                setNotifications({ email: true, sms: false, push: true, sound: true });
                            }
                        }}
                        className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium underline"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    )
}
