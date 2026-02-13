import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import type { SensorData } from './types/sensor';

// Layout
import { MainLayout } from './components/Layout/MainLayout';

// Pages
import { Overview } from './pages/Overview';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [powerHistory, setPowerHistory] = useState<SensorData[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to server');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setSocketConnected(false);
    });

    socket.on('sensorData', (data: SensorData[]) => {
      setSensorData(data);
      
      // Update history for Power sensor (id: pwr_01)
      const powerSensor = data.find(s => s.id === 'pwr_01');
      if (powerSensor) {
        setPowerHistory(prev => {
          const newHistory = [...prev, powerSensor];
          // Keep last 50 points
          if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
          return newHistory;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <MainLayout 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              socketConnected={socketConnected} 
            />
          }
        >
          <Route index element={<Overview sensorData={sensorData} powerHistory={powerHistory} />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
