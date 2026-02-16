import React, { useState } from 'react';
import { Monitor, Volume2, Globe } from 'lucide-react';

export const SystemConfig: React.FC = () => {
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
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* General Settings */}
            <div className="bg-industrial-900 rounded-lg p-6 border border-industrial-700">
                <h3 className="text-xl font-bold mb-6 text-white">System Configuration</h3>
                
                <div className="space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-industrial-300">Refresh Interval</label>
                            <select className="w-full px-4 py-2 rounded-lg border bg-industrial-950 border-industrial-600 text-white focus:outline-none focus:border-brand-500" defaultValue="5">
                                <option value="1">1 Second</option>
                                <option value="2">2 Seconds</option>
                                <option value="5">5 Seconds</option>
                                <option value="10">10 Seconds</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-2 text-industrial-300">Temperature Unit</label>
                            <select 
                                className="w-full px-4 py-2 rounded-lg border bg-industrial-950 border-industrial-600 text-white focus:outline-none focus:border-brand-500"
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
                         <label className="block text-sm font-medium mb-2 text-industrial-300">Time Zone</label>
                         <div className="flex items-center px-4 py-2 rounded-lg border bg-industrial-950 border-industrial-600">
                             <Globe size={16} className="mr-2 text-industrial-400" />
                             <select className="bg-transparent w-full focus:outline-none text-sm text-white" defaultValue="UTC+00:00">
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
            <div className="bg-industrial-900 rounded-lg p-6 border border-industrial-700">
                <h3 className="text-xl font-bold mb-6 text-white">Notifications</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-700 bg-industrial-950">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-brand-800 to-brand-500 rounded-lg">
                                <Monitor size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-white">In-App Notifications</p>
                                <p className="text-sm text-industrial-400">Show popups when dashboard is open</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notifications.push}
                                onChange={() => setNotifications({...notifications, push: !notifications.push})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-industrial-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-industrial-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-800 peer-checked:to-brand-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-700 bg-industrial-950">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-brand-700 to-brand-400 rounded-lg">
                                <Volume2 size={20} className="text-white" />
                            </div>
                             <div>
                                <p className="font-medium text-white">Sound Alerts</p>
                                <p className="text-sm text-industrial-400">Play sound on critical alerts</p>
                            </div>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notifications.sound}
                                onChange={() => setNotifications({...notifications, sound: !notifications.sound})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-industrial-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-industrial-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-brand-800 peer-checked:to-brand-500"></div>
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
                        className="text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium underline"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    )
}
