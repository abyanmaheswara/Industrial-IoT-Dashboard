import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext } from 'react-router-dom';
import { socket } from './socket';
import type { SensorData } from './types/sensor';

// Context
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import { Overview } from './pages/Overview';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Component to handle Socket & Data when Authenticated
const DashboardData = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [powerHistory, setPowerHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // Throttling refs
  const lastUpdateRef = useRef<number>(0);
  const refreshIntervalRef = useRef<number>(2000); // Default 2s matching server

  useEffect(() => {
    // Load initial setting
    const saved = localStorage.getItem('settings_refresh_interval');
    if (saved) {
        refreshIntervalRef.current = parseInt(saved) * 1000;
    }

    const handleSettingsChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.refreshInterval) {
            refreshIntervalRef.current = parseInt(customEvent.detail.refreshInterval) * 1000;
        }
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  useEffect(() => {
    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('token');

    // Fetch initial sensor list
    fetch(`${API_URL}/api/sensors`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(initialSensors => {
        if (Array.isArray(initialSensors)) {
            setSensorData(prev => {
                return initialSensors.map(s => {
                    const existing = prev.find(p => p.id === s.id);
                    if (existing) return { ...s, ...existing };
                    return { ...s, value: s.value || 0, status: s.status || 'unknown', timestamp: Date.now() };
                });
            });
        }
    })
    .catch(err => console.error("Failed to load initial sensors", err));

    // Fetch initial active alerts
    fetch(`${API_URL}/api/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        // Only show active or top 10 most recent
        setAlerts(data.slice(0, 10));
    })
    .catch(err => console.error("Failed to load initial alerts", err));

    const onSensorData = (data: SensorData[]) => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= refreshIntervalRef.current) {
          setSensorData(data);
          lastUpdateRef.current = now;
          
          const powerSensor = data.find(s => s.id === 'pwr_01');
          if (powerSensor) {
            setPowerHistory(prev => {
              const newHistory = [...prev, powerSensor];
              if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
              return newHistory;
            });
          }
      }
    };

    const onNewAlert = (newAlert: any) => {
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    };

    socket.on('sensorData', onSensorData);
    socket.on('newAlert', onNewAlert);

    return () => {
      socket.off('sensorData', onSensorData);
      socket.off('newAlert', onNewAlert);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <MainLayout>
      <Outlet context={{ sensorData, powerHistory, alerts }} />
    </MainLayout>
  );
};

const Overview_Wrapper = () => {
    const { sensorData, powerHistory, alerts } = useOutletContext<{sensorData: SensorData[], powerHistory: SensorData[], alerts: any[]}>();
    return <Overview sensorData={sensorData} powerHistory={powerHistory} alerts={alerts} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route element={<DashboardData />}>
                <Route index element={<Overview_Wrapper />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="settings" element={<Settings />} />
             </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
