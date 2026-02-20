import React, { useState, useEffect } from "react";
import { CheckCircle, Eye, Check, AlertCircle, Clock, ShieldAlert, Activity } from "lucide-react";

interface AlertTableProps {
  alerts: any[];
  onRefresh: () => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset to page 1 when alerts change
  useEffect(() => {
    setCurrentPage(1);
  }, [alerts]);

  // Calculate pagination
  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = alerts.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleAction = async (id: number, action: "acknowledge" | "resolve") => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const status = action === "acknowledge" ? "acknowledged" : "resolved";
      await fetch(`${API_URL}/api/alerts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  return (
    <div className="card-premium overflow-hidden border-white/5">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Source Node</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Severity</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Telemetry Message</th>
              <th className="px-8 py-5 text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Protocol Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-industrial-500 uppercase tracking-[0.2em]">Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {currentAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center opacity-20">
                  <ShieldAlert className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em]">Zero Deviations Detected</p>
                  <p className="text-[10px] mt-2 uppercase tracking-widest text-emerald-500">All systems operating within baseline parameters</p>
                </td>
              </tr>
            ) : (
              currentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-[11px] font-mono text-industrial-400 group-hover:text-industrial-200 transition-colors">
                      {new Date(alert.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                    </div>
                    <div className="text-[9px] text-brand-700 font-black uppercase tracking-tighter mt-1">{new Date(alert.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${alert.type === "critical" ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-brand-main shadow-[0_0_8px_rgba(180,83,9,0.5)]"}`}></div>
                      <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-brand-light transition-colors">{alert.sensor_name || alert.sensor_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {alert.type === "critical" ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-tighter">
                        <Activity size={10} className="animate-pulse" />
                        CRITICAL_ERR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-brand-main/10 text-brand-main border border-brand-main/20 text-[9px] font-black uppercase tracking-tighter">
                        <AlertCircle size={10} />
                        WARN_SIG
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-[11px] text-industrial-400 group-hover:text-industrial-300 line-clamp-2 transition-colors italic leading-relaxed">"{alert.message}"</p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    {alert.status === "active" ? (
                      <span className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                        Live_Incident
                      </span>
                    ) : alert.status === "acknowledged" ? (
                      <span className="flex items-center gap-2 text-brand-main text-[10px] font-black uppercase tracking-widest">
                        <Clock size={12} />
                        In_Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle size={12} />
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3">
                      {alert.status !== "resolved" && (
                        <>
                          {alert.status === "active" && (
                            <button
                              onClick={() => handleAction(alert.id, "acknowledge")}
                              className="p-2 bg-brand-main/10 hover:bg-brand-main/20 text-brand-main border border-brand-main/20 rounded-lg transition-all"
                              title="Acknowledge Incident"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button onClick={() => handleAction(alert.id, "resolve")} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg transition-all" title="Archive Incident">
                            <Check size={16} />
                          </button>
                        </>
                      )}
                      {alert.status === "resolved" && <span className="px-3 py-1.5 rounded bg-white/5 text-industrial-600 text-[10px] font-black uppercase tracking-widest border border-white/5">Locked</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white/[0.01] px-8 py-6 border-t border-white/5 flex items-center justify-between">
        <div className="hidden md:block">
          <span className="text-[10px] text-industrial-600 uppercase font-black tracking-[0.2em]">
            Showing{" "}
            <span className="text-industrial-300 tabular-nums">
              {startIndex + 1}-{Math.min(endIndex, alerts.length)}
            </span>{" "}
            of <span className="text-industrial-300 tabular-nums">{alerts.length}</span> recorded anomalies
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn-premium px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">
            PREV_FRAME
          </button>

          <div className="flex gap-1 mx-4">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                  currentPage === i + 1 ? "bg-brand-main/20 text-brand-light border border-brand-main/40" : "text-industrial-500 hover:text-white border border-transparent"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} className="btn-premium px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">
            NEXT_FRAME
          </button>
        </div>
      </div>
    </div>
  );
};
