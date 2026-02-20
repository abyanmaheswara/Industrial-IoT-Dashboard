import React, { useState, useEffect } from "react";
import { Bell, Volume2, MessageSquare, Zap } from "lucide-react";

export const NotificationsSection: React.FC = () => {
  const [inAppNotes, setInAppNotes] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  useEffect(() => {
    const savedInApp = localStorage.getItem("settings_notifications_inapp");
    if (savedInApp !== null) setInAppNotes(savedInApp === "true");

    const savedSound = localStorage.getItem("settings_notifications_sound");
    if (savedSound !== null) setSoundAlerts(savedSound === "true");
  }, []);

  const toggleInApp = () => {
    const newVal = !inAppNotes;
    setInAppNotes(newVal);
    localStorage.setItem("settings_notifications_inapp", String(newVal));
  };

  const toggleSound = () => {
    const newVal = !soundAlerts;
    setSoundAlerts(newVal);
    localStorage.setItem("settings_notifications_sound", String(newVal));
  };

  return (
    <div className="card-premium p-8 h-full bg-white/[0.01] border-white/5 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="group relative">
          <div className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-industrial-950/40 hover:bg-white/[0.02] transition-all group-hover:border-brand-main/20">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-brand-main/10 rounded-xl border border-brand-main/20 text-brand-main">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Interface Overlays</h4>
                <p className="text-[9px] text-industrial-600 font-mono mt-1 uppercase tracking-tighter">Realtime Visual Alerts // OSD_ENABLE</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${inAppNotes ? "text-brand-main" : "text-industrial-700"}`}>{inAppNotes ? "Active" : "Locked"}</span>
              <button onClick={toggleInApp} className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${inAppNotes ? "bg-brand-main/40 border-brand-main/40" : "bg-industrial-900 border-white/5"} border`}>
                <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all duration-300 ${inAppNotes ? "right-1 bg-white shadow-[0_0_10px_white]" : "left-1 bg-industrial-700"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="flex items-center justify-between p-5 rounded-xl border border-white/5 bg-industrial-950/40 hover:bg-white/[0.02] transition-all group-hover:border-brand-main/20">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-brand-main/10 rounded-xl border border-brand-main/20 text-brand-main">
                <Volume2 size={18} />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Acoustic Signal</h4>
                <p className="text-[9px] text-industrial-600 font-mono mt-1 uppercase tracking-tighter">Critical_Hazard_Freq // AUD_ENABLE</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${soundAlerts ? "text-brand-main" : "text-industrial-700"}`}>{soundAlerts ? "Active" : "Locked"}</span>
              <button onClick={toggleSound} className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${soundAlerts ? "bg-brand-main/40 border-brand-main/40" : "bg-industrial-900 border-white/5"} border`}>
                <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all duration-300 ${soundAlerts ? "right-1 bg-white shadow-[0_0_10px_white]" : "left-1 bg-industrial-700"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-3">
          <Bell size={12} className="text-brand-main" />
          <span className="text-[9px] font-black uppercase tracking-widest">Comm_Protocol_Active</span>
        </div>
        <Zap size={12} className="text-brand-main" />
      </div>
    </div>
  );
};
