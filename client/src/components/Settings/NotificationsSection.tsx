import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export const NotificationsSection: React.FC = () => {
    const [inAppNotes, setInAppNotes] = useState(true);
    const [soundAlerts, setSoundAlerts] = useState(true);

    useEffect(() => {
        const savedInApp = localStorage.getItem('settings_notifications_inapp');
        if (savedInApp !== null) setInAppNotes(savedInApp === 'true');

        const savedSound = localStorage.getItem('settings_notifications_sound');
        if (savedSound !== null) setSoundAlerts(savedSound === 'true');
    }, []);

    const toggleInApp = () => {
        const newVal = !inAppNotes;
        setInAppNotes(newVal);
        localStorage.setItem('settings_notifications_inapp', String(newVal));
    };

    const toggleSound = () => {
        const newVal = !soundAlerts;
        setSoundAlerts(newVal);
        localStorage.setItem('settings_notifications_sound', String(newVal));
    };

    return (
        <div className="card p-6 h-full">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-industrial-200 dark:border-industrial-700">
            <Bell className="text-brand-600 dark:text-brand-400" size={20} />
            <h3 className="text-lg font-medium text-industrial-100 dark:text-industrial-50">
                Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-200 dark:border-industrial-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-brown to-brand-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-industrial-900 dark:text-white">
                    In-App Notifications
                  </div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400">
                    Show popups when dashboard is open
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${inAppNotes ? 'text-brand-600 dark:text-brand-400' : 'text-industrial-500'}`}>
                    {inAppNotes ? 'On' : 'Off'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={inAppNotes} 
                        onChange={toggleInApp}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-industrial-400 dark:bg-industrial-600 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-200 dark:border-industrial-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-industrial-900 dark:text-white">
                    Sound Alerts
                  </div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400">
                    Play sound on critical alerts
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${soundAlerts ? 'text-brand-600 dark:text-brand-400' : 'text-industrial-500'}`}>
                    {soundAlerts ? 'On' : 'Off'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={soundAlerts} 
                        onChange={toggleSound}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-industrial-400 dark:bg-industrial-600 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-brown peer-checked:to-brand-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
    );
};
