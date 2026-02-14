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

    const onConnect = () => {
      // debug: connected
    };

    const onDisconnect = () => {
      // debug: disconnected
    };

    const onSensorData = (data: SensorData[]) => {
      const now = Date.now();
      // Only update if enough time has passed
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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sensorData', onSensorData);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensorData', onSensorData);
      
      // Only disconnect if connected to avoid "WebSocket closed before connection established" error
      // in React Strict Mode (which mounts/unmounts rapidly)
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <MainLayout>
      <Outlet context={{ sensorData, powerHistory }} />
    </MainLayout>
  );
};

const Overview_Wrapper = () => {
    const { sensorData, powerHistory } = useOutletContext<{sensorData: SensorData[], powerHistory: SensorData[]}>();
    return <Overview sensorData={sensorData} powerHistory={powerHistory} />;
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
