import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Settings as SettingsIcon, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { socket } from '../../socket';

interface Alert {
  id: number;
  sensor_id: string;
  type: 'warning' | 'critical';
  message: string;
  status: string;
  created_at: string;
}

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        const res = await fetch('http://localhost:3001/api/alerts');
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
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
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: true 
            })}
          </span>
          <br />
          <span className="text-xs">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            SYSTEM ONLINE
          </span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={`Current Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        >
          <ThemeIcon />
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((alert) => (
                    <div 
                      key={alert.id}
                      className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={handleViewAllAlerts}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === 'critical' 
                            ? 'bg-red-100 dark:bg-red-900/20' 
                            : 'bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.type === 'critical' 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {alert.sensor_id}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(alert.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleViewAllAlerts}
                    className="w-full text-center text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                  >
                    View all alerts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <Link to="/settings" className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <SettingsIcon className="w-6 h-6" />
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-industrial-600 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
             {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <span className="text-white font-bold text-lg">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="hidden md:block text-sm">
            <div className="font-medium text-gray-900 dark:text-white">{user?.username || 'Guest'}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role || 'Viewer'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}


