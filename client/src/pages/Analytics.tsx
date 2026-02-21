import { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Filter, Download, FileText, Table as TableIcon, Activity, Thermometer, Zap, Gauge, Database, Droplets, Power } from "lucide-react";
import { socket } from "../socket";
import type { SensorData } from "../types/sensor";
import { API_URL } from "../config";
import { utils, writeFile } from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { unparse } from "papaparse";

export const Analytics = () => {
  const { sensorData } = useOutletContext<{ sensorData: SensorData[] }>();
  const sensorDataRef = useRef<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>("dht_temp");
  const [dateRange, setDateRange] = useState<string>("24h");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitSystem, setUnitSystem] = useState<string>("Celsius");

  useEffect(() => {
    sensorDataRef.current = sensorData;
  }, [sensorData]);

  useEffect(() => {
    const saved = localStorage.getItem("settings_temp_unit");
    if (saved) setUnitSystem(saved);

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tempUnit) {
        setUnitSystem(customEvent.detail.tempUnit);
      }
    };

    window.addEventListener("settingsChanged", handleSettingsChange);
    return () => window.removeEventListener("settingsChanged", handleSettingsChange);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/sensors/history?sensorId=${selectedSensor}&range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || "Invalid response format");
      }

      // Process data for unit conversion if needed
      const processedData = data.map((d: any) => {
        if (selectedSensor !== "all") {
          const sensor = sensorDataRef.current.find((s) => s.id === selectedSensor);
          if (sensor?.type === "temperature" && unitSystem === "Fahrenheit") {
            return { ...d, value: Number(((d.value * 9) / 5 + 32).toFixed(1)) };
          }
        }
        return d;
      });

      setHistoryData(processedData);
    } catch (err) {
      console.error("Failed to fetch historical data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSensor, dateRange, unitSystem]);

  useEffect(() => {
    fetchData();

    const handleRealTimeUpdate = (data: SensorData[]) => {
      if (selectedSensor === "all") return;

      const updatedSensor = data.find((s) => s.id === selectedSensor);
      if (updatedSensor) {
        let val = updatedSensor.value;
        if (updatedSensor.type === "temperature" && unitSystem === "Fahrenheit") {
          val = Number(((val * 9) / 5 + 32).toFixed(1));
        }

        setHistoryData((prev) => {
          const newData = [...prev, { ...updatedSensor, value: val, timestamp: Date.now() }];
          return newData.slice(-100);
        });
      }
    };

    socket.on("sensorData", handleRealTimeUpdate);

    // Also listen for direct hardware data (from ESP32 via MQTT)
    const handleHardwareUpdate = (data: { id: string; value: number; timestamp: string }) => {
      if (selectedSensor === "all" || data.id !== selectedSensor) return;

      let val = data.value;
      const sensor = sensorDataRef.current.find((s) => s.id === data.id);
      if (sensor?.type === "temperature" && unitSystem === "Fahrenheit") {
        val = Number(((val * 9) / 5 + 32).toFixed(1));
      }

      setHistoryData((prev) => {
        const newPoint = {
          id: data.id,
          value: val,
          timestamp: new Date(data.timestamp).getTime() || Date.now(),
          type: sensor?.type || "unknown",
          status: sensor?.status || "normal",
        };
        return [...prev, newPoint].slice(-100);
      });
    };

    socket.on("hardwareSensorData", handleHardwareUpdate);

    return () => {
      socket.off("sensorData", handleRealTimeUpdate);
      socket.off("hardwareSensorData", handleHardwareUpdate);
    };
  }, [selectedSensor, dateRange, unitSystem, fetchData]);

  const exportToXLSX = () => {
    const ws = utils.json_to_sheet(historyData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sensor Data");
    writeFile(wb, `sensor_data_${selectedSensor}_${dateRange}.xlsx`);
  };

  const exportToCSV = () => {
    const csv = unparse(historyData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sensor_data_${selectedSensor}_${dateRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Sensor Analytics Report: ${selectedSensor}`, 20, 10);
    doc.text(`Range: ${dateRange} | Unit: ${unitSystem}`, 20, 20);

    const tableData = historyData.slice(0, 20).map((d) => [new Date(d.timestamp).toLocaleString(), d.id, d.value.toString()]);

    autoTable(doc, {
      head: [["Timestamp", "Sensor ID", "Value"]],
      body: tableData,
      startY: 30,
    });

    doc.save(`analytics_report_${selectedSensor}.pdf`);
  };

  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "all":
        return <Filter className="w-5 h-5" />;
      case "temperature":
        return <Thermometer className="w-5 h-5 text-brand-main" />;
      case "humidity":
        return <Droplets className="w-5 h-5 text-brand-main" />;
      case "vibration":
        return <Activity className="w-5 h-5 text-brand-main" />;
      case "power":
        return <Zap className="w-5 h-5 text-brand-main" />;
      case "pressure":
        return <Gauge className="w-5 h-5 text-brand-main" />;
      case "relay":
        return <Power className="w-5 h-5 text-brand-main" />;
      default:
        return <Database className="w-5 h-5 text-industrial-500" />;
    }
  };

  const activeSensors = [...sensorData];

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 h-full overflow-y-auto custom-scrollbar relative">
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex flex-col">
          <h1 className="text-[12px] font-black text-white tracking-[0.4em] uppercase flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand-main" />
            Archive Telemetry Engine
          </h1>
          <p className="text-[9px] text-industrial-600 font-mono mt-2 uppercase tracking-widest italic">Sector_Analytics // Historical Data Processing Node</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-industrial-950/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
            {activeSensors.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedSensor(btn.id)}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  selectedSensor === btn.id ? "bg-brand-main/20 text-brand-light shadow-lg border border-brand-main/30" : "text-industrial-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                title={btn.id}
              >
                {getSensorIcon(btn.type)}
              </button>
            ))}
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-industrial-950 border border-white/5 text-[10px] font-black text-industrial-400 uppercase tracking-widest px-5 py-3 rounded-xl focus:border-brand-main/50 outline-none transition-all shadow-inner"
          >
            <option value="1h">Pulse (1hr)</option>
            <option value="24h">Cycle (24hr)</option>
            <option value="7d">Spectrum (7d)</option>
            <option value="30d">Archive (30d)</option>
          </select>

          <div className="flex gap-2">
            <button onClick={generatePDF} className="btn-premium flex items-center gap-2 group">
              <FileText size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px]">PDF Report</span>
            </button>
            <button onClick={exportToXLSX} className="btn-premium flex items-center gap-2 group">
              <TableIcon size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px]">Excel DB</span>
            </button>
            <button onClick={exportToCSV} className="btn-premium flex items-center gap-2 group">
              <Download size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px]">CSV Raw</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-12 card-premium p-8 h-[550px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="w-16 h-16 border-2 border-white/5 border-t-brand-main rounded-2xl animate-spin mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-industrial-500 animate-pulse">Reconstructing Signal History...</p>
            </div>
          ) : (
            <div className="h-full -ml-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b45309" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#473c31" vertical={false} opacity={0.15} />
                  <XAxis dataKey="timestamp" stroke="#473c31" tick={{ fill: "#635445", fontSize: 10, fontWeight: "bold" }} tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
                  <YAxis stroke="#473c31" tick={{ fill: "#635445", fontSize: 10, fontWeight: "bold" }} />
                  <Tooltip
                    labelFormatter={(t) => `🕐 ${new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
                    contentStyle={{
                      backgroundColor: "#0d0b09",
                      border: "1px solid #473c31",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#e6d5bc",
                    }}
                    itemStyle={{ color: "#b45309", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#b45309" strokeWidth={3} fill="url(#analyticsGradient)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-12">
          <div className="card-premium overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-black text-brand-light uppercase tracking-[0.4em]">Signal Matrix Log</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-industrial-950/60 border-b border-white/5">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Node ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Reading</th>
                    <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {historyData
                    .slice(-15)
                    .reverse()
                    .map((d, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-5 text-[11px] font-mono text-industrial-400 group-hover:text-industrial-200">{new Date(d.timestamp).toLocaleString()}</td>
                        <td className="px-8 py-5 text-[11px] font-black text-white uppercase tracking-widest">{d.id}</td>
                        <td className="px-8 py-5 text-[11px] font-bold text-industrial-500 uppercase">{d.type || "SENS_O"}</td>
                        <td className="px-8 py-5 text-[12px] font-black text-brand-main">
                          {d.value} <span className="text-[10px] opacity-50 ml-1">{unitSystem === "Celsius" ? "°C" : unitSystem === "Fahrenheit" ? "°F" : "U"}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-2.5 py-1 rounded ${d.status === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : d.status === "warning" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"} text-[9px] font-black uppercase tracking-tighter`}
                          >
                            {d.status || "NORMAL"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {historyData.length === 0 && !loading && (
                <div className="py-20 text-center opacity-20">
                  <Database className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Data in Selected Spectrum</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
