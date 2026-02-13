import React, { useState } from 'react';
import { Moon, Sun, Monitor, Bell, Volume2, Globe } from 'lucide-react';

export const SystemConfig: React.FC = () => {
    const [theme, setTheme] = useState('dark');
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
        sound: true
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* General Settings */}
            <div className="card p-6">
                <h3 className="text-lg font-medium text-white mb-4 border-b border-industrial-800 pb-2">System Configuration</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Theme Preference</label>
                        <div className="flex space-x-4">
                            <button 
                                onClick={() => setTheme('light')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded border ${theme === 'light' ? 'bg-industrial-800 border-blue-500 text-blue-500' : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'}`}
                            >
                                <Sun size={24} className="mb-2" />
                                <span className="text-xs">Light</span>
                            </button>
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded border ${theme === 'dark' ? 'bg-industrial-800 border-blue-500 text-blue-500' : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'}`}
                            >
                                <Moon size={24} className="mb-2" />
                                <span className="text-xs">Dark</span>
                            </button>
                            <button 
                                onClick={() => setTheme('system')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded border ${theme === 'system' ? 'bg-industrial-800 border-blue-500 text-blue-500' : 'bg-industrial-900 border-industrial-800 text-industrial-400 hover:text-white'}`}
                            >
                                <Monitor size={24} className="mb-2" />
                                <span className="text-xs">System</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Refresh Interval</label>
                            <select className="w-full bg-industrial-900 border border-industrial-800 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                                <option value="1">1 Second</option>
                                <option value="2">2 Seconds</option>
                                <option value="5" selected>5 Seconds</option>
                                <option value="10">10 Seconds</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-white mb-2">Temperature Unit</label>
                            <select className="w-full bg-industrial-900 border border-industrial-800 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500">
                                <option value="c" selected>Celsius (°C)</option>
                                <option value="f">Fahrenheit (°F)</option>
                                <option value="k">Kelvin (K)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-white mb-2">Time Zone</label>
                         <div className="flex items-center bg-industrial-900 border border-industrial-800 rounded px-3 py-2 text-white">
                             <Globe size={16} className="mr-2 text-industrial-500" />
                             <select className="bg-transparent w-full focus:outline-none text-sm">
                                 <option>UTC-08:00 Pacific Time</option>
                                 <option>UTC-05:00 Eastern Time</option>
                                 <option selected>UTC+00:00 Coordinated Universal Time</option>
                                 <option>UTC+07:00 Western Indonesia Time</option>
                             </select>
                         </div>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="card p-6">
                <h3 className="text-lg font-medium text-white mb-4 border-b border-industrial-800 pb-2">Notifications</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-industrial-900 rounded border border-industrial-800">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-500/20 text-blue-500 rounded mr-3">
                                <Monitor size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">In-App Notifications</p>
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
                                <p className="text-sm font-medium text-white">Sound Alerts</p>
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
            </div>
        </div>
    )
}
