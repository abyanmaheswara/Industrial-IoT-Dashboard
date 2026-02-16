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
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-industrial-800">
            <Bell className="text-brand-500" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-800 bg-industrial-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-700 to-brand-500 rounded-lg shadow-[0_0_10px_rgba(168,121,50,0.3)]">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white">
                    In-App Notifications
                  </div>
                  <div className="text-sm text-industrial-500">
                    Show popups when dashboard is open
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${inAppNotes ? 'text-brand-500' : 'text-industrial-600'}`}>
                    {inAppNotes ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={inAppNotes} 
                        onChange={toggleInApp}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-industrial-900 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-700 peer-checked:to-brand-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-industrial-800"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-industrial-800 bg-industrial-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-brand-600 to-brand-400 rounded-lg shadow-[0_0_10px_rgba(168,121,50,0.3)]">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white">
                    Sound Alerts
                  </div>
                  <div className="text-sm text-industrial-500">
                    Play sound on critical alerts
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${soundAlerts ? 'text-brand-500' : 'text-industrial-600'}`}>
                    {soundAlerts ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={soundAlerts} 
                        onChange={toggleSound}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-industrial-900 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-600 peer-checked:to-brand-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-industrial-800"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
    );
};
