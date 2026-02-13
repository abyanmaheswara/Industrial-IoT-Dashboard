import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Settings as SettingsIcon, Moon, Sun, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);

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

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  }

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
        <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

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


