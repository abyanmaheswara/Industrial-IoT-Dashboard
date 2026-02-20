import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, Settings as SettingsIcon, AlertTriangle, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../../socket";

interface Alert {
  id: number;
  sensor_id: string;
  type: "warning" | "critical";
  message: string;
  status: string;
  created_at: string;
  time?: string; // Optional for display
}

export function Header({ mqttStatus }: { mqttStatus?: { connected: boolean; clients: number } }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAvatar = () => {
      if (user?.username) {
        const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
        if (savedAvatar) setAvatar(savedAvatar);
      }
    };
    loadAvatar();
    window.addEventListener("avatarUpdate", loadAvatar);
    return () => window.removeEventListener("avatarUpdate", loadAvatar);
  }, [user]);

  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const activeAlerts = data.filter((a: Alert) => a.status === "active").slice(0, 5);
        setNotifications(activeAlerts);
        setUnreadCount(activeAlerts.length);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    fetchRecentAlerts();
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const onNewAlert = (newAlert: Alert) => {
      setNotifications((prev) => [newAlert, ...prev.slice(0, 4)]);
      setUnreadCount((prev) => prev + 1);
    };
    const onAlertUpdated = (updatedAlert: Alert) => {
      setNotifications((prev) => prev.filter((a) => a.id !== updatedAlert.id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };
    socket.on("newAlert", onNewAlert);
    socket.on("alertUpdated", onAlertUpdated);
    return () => {
      socket.off("newAlert", onNewAlert);
      socket.off("alertUpdated", onAlertUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowDropdown(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-industrial-900/80 backdrop-blur-2xl border-b border-industrial-700/50 flex items-center justify-between px-10 relative z-30 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-main/[0.03] to-transparent pointer-events-none" />

      <div className="flex items-center gap-8 relative z-10">
        <div className="flex flex-col border-l-2 border-brand-main/30 pl-4 py-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-main pulse-status" />
            <span className="text-[12px] font-black text-white tracking-[0.3em] uppercase font-mono">{currentTime.toLocaleTimeString("en-US", { hour12: false })}</span>
            {user?.role === "viewer" && <span className="ml-4 px-2 py-0.5 bg-brand-main/10 border border-brand-main/30 text-brand-main text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">Demo_Access_Active</span>}
          </div>
          <span className="text-[9px] text-industrial-500 font-bold uppercase tracking-[0.2em]">Sector_07 // Operational Sync</span>
        </div>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        {/* Network Uplink Status */}
        <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-industrial-950/40 border border-brand-main/10 rounded-xl group hover:border-brand-main/20 transition-all cursor-default shadow-inner">
          <div className={`w-2 h-2 ${mqttStatus?.connected ? "bg-emerald-500" : "bg-red-500"} rounded-full pulse-status`} />
          <div className="flex flex-col">
            <span className={`text-[10px] font-black ${mqttStatus?.connected ? "text-emerald-500" : "text-red-500"} uppercase tracking-widest leading-none mb-1`}>{mqttStatus?.connected ? "Uplink Active" : "Signal Lost"}</span>
            <span className="text-[8px] text-industrial-600 font-mono uppercase">Nodes: {mqttStatus?.clients || 0}</span>
          </div>
        </div>

        {/* Signal Hub */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`relative p-3 rounded-xl border transition-all duration-300 ${
              showDropdown ? "bg-brand-main/10 border-brand-main/40 text-brand-light shadow-[0_0_25px_rgba(180,83,9,0.2)]" : "text-industrial-400 border-white/5 hover:border-brand-main/20 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Bell size={20} className={unreadCount > 0 ? "animate-float" : ""} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-main text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-industrial-900 shadow-xl">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-6 w-96 bg-industrial-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.95)]">
              <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-brand-main to-transparent opacity-50" />

              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-brand-light uppercase tracking-[0.4em]">Signal Alerts</h3>
                <button
                  onClick={() => {
                    setNotifications([]);
                    setUnreadCount(0);
                    setShowDropdown(false);
                  }}
                  className="text-[9px] font-black text-industrial-500 uppercase hover:text-brand-light transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  Ack_All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {notifications.length === 0 ? (
                  <div className="py-16 text-center text-industrial-600">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Signals</p>
                  </div>
                ) : (
                  notifications.map((alert) => (
                    <div
                      key={alert.id}
                      className="m-1 p-5 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all group/item"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/alerts");
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl border transition-all ${alert.type === "critical" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-brand-main/10 border-brand-main/20 text-brand-light"}`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">{alert.sensor_id}</p>
                            <span className="text-[9px] text-industrial-500 font-mono font-bold">{new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="text-[12px] text-industrial-400 group-hover/item:text-industrial-200 transition-colors leading-relaxed line-clamp-2">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/alerts");
                    }}
                    className="btn-premium btn-premium-secondary w-full"
                  >
                    Enter Archive Matrix
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Control */}
        <div className="relative" ref={profileRef} style={{ marginLeft: "1rem" }}>
          <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className={`flex items-center gap-4 pl-8 border-l border-industrial-700/50 group transition-all duration-300 ${showProfileDropdown ? "scale-[1.03]" : ""}`}>
            <div className="relative">
              <div className="w-11 h-11 bg-industrial-950 border-2 border-industrial-800 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl group-hover:border-brand-main/50 transition-all">
                {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-brand-main font-black text-lg">{user?.username?.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-industrial-900 shadow-md" />
            </div>

            <div className="hidden md:block text-left">
              <div className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-1 group-hover:text-brand-light transition-colors">{user?.full_name || user?.username || "OP_CORE_B"}</div>
              <div className="text-[9px] text-industrial-500 font-mono font-bold uppercase tracking-tighter italic">{user?.role === "viewer" ? "Public Guest Access 🌐" : "Lvl 3 Authentication 🔐"}</div>
            </div>
            <ChevronDown size={14} className={`text-industrial-600 transition-all duration-500 ${showProfileDropdown ? "rotate-180 text-brand-main" : "group-hover:text-industrial-400"}`} />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-6 w-64 bg-industrial-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300 origin-top-right shadow-[0_30px_100px_rgba(0,0,0,0.95)]">
              <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-black text-brand-main uppercase tracking-[0.35em] mb-1.5">Operational Node</p>
                <p className="text-[13px] font-black text-white truncate">{user?.full_name || user?.username || "Guest Identity"}</p>
                <p className="text-[9px] text-industrial-600 font-bold uppercase mt-1">Sector: Command_Central // B-12</p>
              </div>

              <div className="p-2 space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-4 px-5 py-3 text-[10px] font-black text-industrial-400 uppercase tracking-widest hover:text-white hover:bg-white/[0.03] rounded-xl transition-all group/link"
                >
                  <SettingsIcon size={16} className="group-hover/link:text-brand-main transition-colors" />
                  Sys Architecture
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 text-[10px] font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group/logout"
                >
                  <LogOut size={16} className="group-hover/logout:translate-x-1 transition-transform" />
                  Terminate Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
