import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Settings as SettingsIcon, AlertTriangle, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { socket } from '../../socket';

interface Alert {
  id: number;
  sensor_id: string;
  type: 'warning' | 'critical';
  message: string;
  status: string;
  created_at: string;
  time?: string; // Optional for display
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Dropdown States
  const [showDropdown, setShowDropdown] = useState(false); // Notifications
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // Profile
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load avatar
  useEffect(() => {
    const loadAvatar = () => {
      if (user?.username) {
        const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
        if (savedAvatar) setAvatar(savedAvatar);
      }
    };

    loadAvatar();

    const handleAvatarUpdate = () => loadAvatar();
    window.addEventListener('avatarUpdate', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdate', handleAvatarUpdate);
    };
  }, [user]);

  // Fetch initial alerts
  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/alerts`);
        const data = await res.json();
        const activeAlerts = data.filter((a: Alert) => a.status === 'active').slice(0, 5);
        setNotifications(activeAlerts);
        setUnreadCount(activeAlerts.length);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchRecentAlerts();
  }, []);

  // Socket connection for real-time alerts
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onNewAlert = (newAlert: Alert) => {
      setNotifications(prev => [newAlert, ...prev.slice(0, 4)]);
      setUnreadCount(prev => prev + 1);
    };

    const onAlertUpdated = (updatedAlert: Alert) => {
      setNotifications(prev => prev.filter(a => a.id !== updatedAlert.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    socket.on('newAlert', onNewAlert);
    socket.on('alertUpdated', onAlertUpdated);

    return () => {
      socket.off('newAlert', onNewAlert);
      socket.off('alertUpdated', onAlertUpdated);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Notifications
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      // Profile
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
          setShowProfileDropdown(false);
      }
    };

    if (showDropdown || showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showProfileDropdown]);

  const handleLogout = () => {
      logout();
      navigate('/login');
  };



  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleViewAllAlerts = () => {
    setShowDropdown(false);
    navigate('/alerts');
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowDropdown(false);
  };

  return (
    <header className="h-16 bg-brand-950/80 backdrop-blur-xl border-b border-brand-500/30 flex items-center justify-between px-8 relative z-30 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Background visual detail */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/[0.05] to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_#f59e0b]" />
              <span className="text-[11px] font-black text-white tracking-[0.2em] uppercase">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })}
              </span>
          </div>
          <span className="text-[9px] text-brand-800 font-mono font-bold uppercase tracking-widest pl-3.5">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        {/* System Status Display */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-industrial-950/40 border border-brand-500/10 rounded-lg group hover:border-brand-500/30 transition-all cursor-default">
          <div className="relative">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
             <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-20" />
          </div>
          <div className="flex flex-col">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none mb-0.5">
                Terminal Online
              </span>
              <span className="text-[8px] text-industrial-600 font-mono uppercase tracking-tighter">Secure Uplink Established</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleNotificationClick}
            className={`relative p-2.5 rounded-lg border transition-all duration-300 ${
                showDropdown 
                ? 'bg-brand-500/10 border-brand-500/40 text-brand-500 shadow-[0_0_15px_rgba(180,83,9,0.2)]' 
                : 'text-industrial-500 border-transparent hover:border-brand-500/20 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-industrial-950 animate-bounce shadow-[0_0_8px_rgba(168,121,50,0.5)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown (Obsidian Glass) */}
          {showDropdown && (
            <div className="absolute right-0 mt-4 w-80 bg-industrial-950/95 backdrop-blur-2xl rounded-xl border border-brand-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
               {/* Decorative header gradient */}
               <div className="h-1 w-full bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
               
              <div className="p-4 border-b border-brand-500/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Signal alerts</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[9px] font-bold text-industrial-500 uppercase hover:text-brand-500 transition-colors"
                  >
                    Ack all
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-industrial-600">
                    <Bell className="w-10 h-10 mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No active signals</p>
                  </div>
                ) : (
                  notifications.map((alert) => (
                    <div 
                      key={alert.id}
                      className="p-4 border-b border-brand-500/5 hover:bg-white/[0.02] cursor-pointer transition-all group/item"
                      onClick={handleViewAllAlerts}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border transition-colors ${
                          alert.type === 'critical' 
                            ? 'bg-red-950/20 border-red-500/30 group-hover/item:border-red-500/50' 
                            : 'bg-amber-950/20 border-amber-500/30 group-hover/item:border-amber-500/50'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.type === 'critical' ? 'text-red-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                               {alert.sensor_id}
                             </p>
                             <span className="text-[8px] text-industrial-600 font-mono">
                                {new Date(alert.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                             </span>
                          </div>
                          <p className="text-[11px] text-industrial-400 group-hover/item:text-industrial-200 transition-colors leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-brand-500/10 bg-white/[0.01]">
                  <button 
                    onClick={handleViewAllAlerts}
                    className="group/btn w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] hover:text-white transition-all"
                  >
                    Access Archive
                    <div className="w-1 h-1 rounded-full bg-brand-500 group-hover/btn:animate-ping" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile (Premium Feel) */}
        <div className="relative" ref={profileRef}>
            <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex items-center gap-3 pl-5 border-l border-brand-500/20 transition-all duration-300 group ${
                    showProfileDropdown ? 'scale-[1.02]' : ''
                }`}
            >
                <div className="relative">
                    <div className="w-9 h-9 bg-industrial-950 border border-brand-500/30 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-brand-500/60 transition-all">
                        {avatar ? (
                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-brand-500 font-mono font-bold text-base">{user?.username?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-industrial-950" />
                </div>
                
                <div className="hidden md:block text-left">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1 group-hover:text-brand-400 transition-colors">
                        {user?.username || 'GUEST_OPER'}
                    </div>
                    <div className="text-[8px] text-industrial-600 font-mono font-bold uppercase tracking-tighter">
                       Level {user?.role === 'admin' ? '3' : user?.role === 'operator' ? '2' : '1'} • Sector C
                    </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-industrial-600 transition-all duration-300 ${showProfileDropdown ? 'rotate-180 text-brand-500' : 'group-hover:text-industrial-400'}`} />
            </button>

            {/* Profile Dropdown (Obsidian Glass) */}
            {showProfileDropdown && (
                <div className="absolute right-0 mt-4 w-56 bg-industrial-950/95 backdrop-blur-2xl rounded-xl border border-brand-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                    <div className="p-5 border-b border-brand-500/10 bg-white/[0.02]">
                        <p className="text-[9px] font-black text-brand-700 uppercase tracking-[0.3em] mb-1">Operator Profile</p>
                        <p className="text-[11px] font-bold text-white truncate">{user?.username || 'Guest Identity'}</p>
                    </div>
                    
                    <div className="p-1.5">
                        <Link 
                            to="/settings" 
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-industrial-500 uppercase tracking-widest hover:text-white hover:bg-white/[0.04] rounded-lg transition-all group/link"
                        >
                            <SettingsIcon className="w-4 h-4 text-industrial-600 group-hover/link:text-brand-500 transition-colors" />
                            Sys Config
                        </Link>
                    </div>

                    <div className="p-1.5 border-t border-brand-500/10 bg-industrial-950/20">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-red-500/70 uppercase tracking-widest hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all group/logout"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover/logout:translate-x-1" />
                            Terminate Session
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}


