import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext } from "react-router-dom";
import { socket } from "./socket";
import type { SensorData } from "./types/sensor";

// Context
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Layout
import MainLayout from "./components/Layout/MainLayout";

// Pages
import { Overview } from "./pages/Overview";
import { Analytics } from "./pages/Analytics";
import { Alerts } from "./pages/Alerts";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotificationSystem } from "./components/NotificationSystem";

// Component to handle Socket & Data when Authenticated
const DashboardData = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [powerHistory, setPowerHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mqttStatus, setMqttStatus] = useState<{ connected: boolean; clients: number }>({ connected: false, clients: 0 });

  // Use a ref for the latest sensor data to avoid closure issues in socket handlers
  const sensorDataRef = useRef<SensorData[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const refreshIntervalRef = useRef<number>(2000);

  useEffect(() => {
    sensorDataRef.current = sensorData;
  }, [sensorData]);

  useEffect(() => {
    const saved = localStorage.getItem("settings_refresh_interval");
    if (saved) {
      refreshIntervalRef.current = parseInt(saved) * 1000;
    }

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.refreshInterval) {
        refreshIntervalRef.current = parseInt(customEvent.detail.refreshInterval) * 1000;
      }
    };

    window.addEventListener("settingsChanged", handleSettingsChange);
    return () => window.removeEventListener("settingsChanged", handleSettingsChange);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const token = localStorage.getItem("token");

    // Initial Fetch
    const fetchData = async () => {
      try {
        const [sensorsRes, alertsRes, mqttRes] = await Promise.all([
          fetch(`${API_URL}/api/sensors`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/mqtt/status`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const initialSensors = await sensorsRes.json();
        const initialAlerts = await alertsRes.json();
        const initialMqtt = await mqttRes.json();

        if (mqttRes.ok) setMqttStatus(initialMqtt);

        if (Array.isArray(initialSensors)) {
          setSensorData(
            initialSensors.map((s) => ({
              ...s,
              value: s.value || 0,
              timestamp: Date.now(),
            })),
          );
        }

        if (Array.isArray(initialAlerts)) {
          setAlerts(initialAlerts.slice(0, 10));
        }
      } catch (err) {
        console.error("Critical: Initial data sync failed", err);
      }
    };

    fetchData();

    const onSensorData = (data: SensorData[]) => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= refreshIntervalRef.current) {
        setSensorData(data);
        lastUpdateRef.current = now;

        const mainSensor = data.find((s) => s.id === "dht_temp");
        if (mainSensor) {
          setPowerHistory((prev) => {
            const newHistory = [...prev, { ...mainSensor, timestamp: now }];
            return newHistory.slice(-50);
          });
        }
      }
    };

    const onNewAlert = (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
      // Dispatch for NotificationSystem
      window.dispatchEvent(new CustomEvent("newInternalAlert", { detail: newAlert }));
    };

    const onMqttStatus = (status: { connected: boolean; clients: number }) => {
      setMqttStatus(status);
    };

    const lastUpdateRef = { current: 0 };

    const onHardwareData = (data: { id: string; value: number; timestamp: string }) => {
      const now = Date.now();
      const intervalMs = parseInt(refreshIntervalRef.current) * 1000;

      // Throttle: only update state if interval has passed
      if (now - lastUpdateRef.current < intervalMs && lastUpdateRef.current !== 0) {
        return;
      }

      lastUpdateRef.current = now;

      setSensorData((prev) => {
        const index = prev.findIndex((s) => s.id === data.id);
        if (index === -1) return prev;
        const newArr = [...prev];
        newArr[index] = {
          ...newArr[index],
          value: data.value,
          timestamp: new Date(data.timestamp).getTime(),
        };
        return newArr;
      });

      // Update history chart if it's the main temperature sensor
      if (data.id === "dht_temp") {
        setPowerHistory((prev) => {
          const newPoint: SensorData = {
            id: data.id,
            value: data.value,
            timestamp: new Date(data.timestamp).getTime(),
            name: "ESP32 Temp",
            type: "temperature",
            unit: "°C",
            status: data.value > 40 ? "critical" : data.value > 30 ? "warning" : "normal",
          };
          return [...prev, newPoint].slice(-50);
        });
      }
    };

    socket.on("sensorData", onSensorData);
    socket.on("newAlert", onNewAlert);
    socket.on("mqttStatus", onMqttStatus);
    socket.on("hardwareSensorData", onHardwareData);

    return () => {
      socket.off("sensorData", onSensorData);
      socket.off("newAlert", onNewAlert);
      socket.off("mqttStatus", onMqttStatus);
      socket.off("hardwareSensorData", onHardwareData);
    };
  }, []);

  return (
    <MainLayout mqttStatus={mqttStatus}>
      <Outlet context={{ sensorData, powerHistory, alerts, mqttStatus }} />
      <NotificationSystem />
    </MainLayout>
  );
};

const Overview_Wrapper = () => {
  const { sensorData, powerHistory, alerts, mqttStatus } = useOutletContext<{ sensorData: SensorData[]; powerHistory: SensorData[]; alerts: any[]; mqttStatus: { connected: boolean; clients: number } }>();
  return <Overview sensorData={sensorData} powerHistory={powerHistory} alerts={alerts} mqttStatus={mqttStatus} />;
};

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
