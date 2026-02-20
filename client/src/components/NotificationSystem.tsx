import React, { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "critical" | "warning";
  sensor_name?: string;
}

export const NotificationSystem: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sound Synthesis Logic
  const playAlertSound = useCallback((type: "critical" | "warning") => {
    const isSoundEnabled = localStorage.getItem("settings_notifications_sound") !== "false";
    if (!isSoundEnabled) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "critical") {
        // High-pitched urgent siren
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else {
        // Subtle warning beep
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context Failure:", e);
    }
  }, []);

  const addToast = useCallback(
    (alert: any) => {
      const isVisualEnabled = localStorage.getItem("settings_notifications_inapp") !== "false";

      // Play sound regardless of visual toggle, based on its own toggle
      playAlertSound(alert.type);

      if (!isVisualEnabled) return;

      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [{ id, ...alert }, ...prev].slice(0, 3));

      // Auto-remove
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [playAlertSound],
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleNewAlert = (e: any) => {
      if (e.detail) {
        addToast(e.detail);
      }
    };

    window.addEventListener("newInternalAlert", handleNewAlert);
    return () => window.removeEventListener("newInternalAlert", handleNewAlert);
  }, [addToast]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-80 animate-in slide-in-from-right-10 fade-in duration-500 card-premium p-4 border-l-4 ${
            toast.type === "critical" ? "border-l-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : "border-l-brand-main bg-brand-main/5 shadow-[0_0_30px_rgba(180,83,9,0.1)]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${toast.type === "critical" ? "bg-red-500/20 text-red-500" : "bg-brand-main/20 text-brand-main"}`}>
              {toast.type === "critical" ? <ShieldAlert size={18} className="animate-pulse" /> : <AlertTriangle size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${toast.type === "critical" ? "text-red-500" : "text-brand-main"}`}>{toast.type === "critical" ? "Critical Protocol Breach" : "System Deviation"}</span>
                <button onClick={() => removeToast(toast.id)} className="text-industrial-600 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11px] font-bold text-white uppercase tracking-tight truncate">{toast.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-1 h-1 rounded-full ${toast.type === "critical" ? "bg-red-500 animate-pulse" : "bg-brand-main"}`} />
                <span className="text-[8px] font-black text-industrial-500 uppercase tracking-widest">Source: {toast.sensor_name || "Unknown_Node"}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
