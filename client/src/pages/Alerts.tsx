import React from "react";
import { ShieldAlert, Settings } from "lucide-react";
import { AlertStats } from "../components/Alerts/AlertStats";
import { AlertFilters } from "../components/Alerts/AlertFilters";
import { AlertTable } from "../components/Alerts/AlertTable";
import { socket } from "../socket";
import { RuleConfigModal } from "../components/Alerts/RuleConfigModal";
import { API_URL } from "../config";

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [displayedAlerts, setDisplayedAlerts] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ critical: 0, warning: 0, acknowledged: 0, avgResponse: "-" });
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);

  // Filter States
  const [filterType, setFilterType] = React.useState("all");
  const [showCriticalOnly, setShowCriticalOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchAlerts = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || "Invalid response format");
      }

      setAlerts(data);

      // Calculate stats
      const crit = data.filter((a: any) => a.type === "critical").length;
      const warn = data.filter((a: any) => a.type === "warning").length;
      const ack = data.filter((a: any) => a.status === "acknowledged").length;

      // Calculate Avg Response
      const resolved = data.filter((a: any) => a.resolved_at);
      let avgTime = "N/A";
      if (resolved.length > 0) {
        const totalTime = resolved.reduce((acc: number, curr: any) => {
          return acc + (new Date(curr.resolved_at).getTime() - new Date(curr.created_at).getTime());
        }, 0);
        const avgMinutes = Math.round(totalTime / resolved.length / 60000);
        avgTime = `${avgMinutes}m`;
      }

      setStats({ critical: crit, warning: warn, acknowledged: ack, avgResponse: avgTime });
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  }, []);

  // Apply Filters
  React.useEffect(() => {
    let result = [...alerts];

    if (showCriticalOnly) {
      result = result.filter((a) => a.type === "critical");
    }

    if (filterType !== "all") {
      result = result.filter((a) => a.type === filterType);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((a) => {
        const message = (a.message || "").toLowerCase();
        const sensorId = (a.sensor_id || "").toLowerCase();
        const sensorName = (a.sensor_name || "").toLowerCase();

        return message.includes(lowerQuery) || sensorId.includes(lowerQuery) || sensorName.includes(lowerQuery);
      });
    }

    setDisplayedAlerts(result);
  }, [alerts, showCriticalOnly, filterType, searchQuery]);

  React.useEffect(() => {
    fetchAlerts(); // Initial fetch

    const onNewAlert = (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };

    socket.on("newAlert", onNewAlert);
    return () => {
      socket.off("newAlert", onNewAlert);
    };
  }, [fetchAlerts]);

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 h-full overflow-y-auto custom-scrollbar relative">
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-[12px] font-black text-white tracking-[0.4em] uppercase flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Security & Anomaly Command
          </h1>
          <p className="text-[9px] text-industrial-600 font-mono mt-2 uppercase tracking-widest italic">Sector_Alert_Service // Real-time Incident Matrix</p>
        </div>

        <button onClick={() => setIsConfigOpen(true)} className="btn-premium flex items-center gap-2 group border-brand-500/20">
          <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-[10px] uppercase font-black tracking-widest">Protocol Rules</span>
        </button>
      </div>

      <div className="space-y-8 relative z-10">
        <AlertStats stats={stats} />

        <AlertFilters filterType={filterType} setFilterType={setFilterType} showCriticalOnly={showCriticalOnly} setShowCriticalOnly={setShowCriticalOnly} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <AlertTable alerts={displayedAlerts} onRefresh={fetchAlerts} />
      </div>

      <RuleConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={() => {
          fetchAlerts();
        }}
      />
    </div>
  );
};
