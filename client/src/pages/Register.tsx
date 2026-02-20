import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, AlertTriangle, ShieldCheck, Activity, Key } from "lucide-react";

export const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Operational passwords do not synchronize");
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Provisioning failed");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-6 relative overflow-hidden custom-scrollbar">
      {/* BACKGROUND ARCHITECTURE */}
      <div className="industrial-grid-premium absolute inset-0 opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#b4530910_0%,_transparent_70%)] opacity-30 animate-pulse" />
      <div className="scanline opacity-[0.03]" />

      {/* CORE PROVISIONING TERMINAL */}
      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        {/* MECHANICAL BRACKETS */}
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-[3px] border-l-[3px] border-brand-main/30 rounded-tl-2xl" />
        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-[3px] border-r-[3px] border-brand-main/30 rounded-tr-2xl" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-[3px] border-l-[3px] border-brand-main/30 rounded-bl-2xl" />
        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-[3px] border-r-[3px] border-brand-main/30 rounded-br-2xl" />

        <div className="card-premium p-10 sm:p-12 relative overflow-hidden backdrop-blur-3xl border-white/5 bg-industrial-950/60 shadow-[0_0_100px_rgba(0,0,0,0.9)]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-main/[0.05] to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* TERMINAL HEADER */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-industrial-950 border border-brand-main/20 mb-6 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-brand-main/5 animate-pulse" />
                <Key size={32} className="text-brand-main relative z-10 filter drop-shadow-[0_0_12px_rgba(180,83,9,0.5)]" />
              </div>
              <h1 className="text-[14px] font-black text-white tracking-[0.5em] mb-2 uppercase">
                New <span className="text-brand-main">Operator</span>
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-6 bg-brand-main/20" />
                <p className="text-[9px] text-industrial-600 font-mono font-black uppercase tracking-[0.3em] italic">Protocol_REG // Provisioning_V9</p>
                <div className="h-px w-6 bg-brand-main/20" />
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Provisioning Error</h4>
                  <p className="text-[11px] text-red-400/70 mt-1 leading-relaxed lowercase font-mono">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <div className="flex justify-between items-end mb-2 px-1">
                    <label className="text-[10px] font-black text-industrial-500 uppercase tracking-widest group-focus-within:text-brand-main transition-colors">Designation</label>
                    <span className="text-[8px] text-industrial-700 font-mono tracking-tighter">IDENT_X7</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User size={16} className="text-industrial-600 group-focus-within:text-brand-main transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-14 pr-4 py-3.5 bg-industrial-950/40 border border-white/5 rounded-xl text-white font-mono text-[12px] placeholder-industrial-700 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 outline-none transition-all shadow-inner uppercase tracking-wider"
                      placeholder="NEW_OPER_ID"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest group-focus-within:text-brand-main transition-colors mb-2 px-1">Cipher</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock size={15} className="text-industrial-600 group-focus-within:text-brand-main transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-industrial-950/40 border border-white/5 rounded-xl text-white font-mono text-[11px] placeholder-industrial-700 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 transition-all outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest group-focus-within:text-brand-main transition-colors mb-2 px-1">Verify</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <ShieldCheck size={15} className="text-industrial-600 group-focus-within:text-brand-main transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-industrial-950/40 border border-white/5 rounded-xl text-white font-mono text-[11px] placeholder-industrial-700 focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 transition-all outline-none"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-industrial-500 uppercase tracking-widest group-focus-within:text-brand-main transition-colors mb-2 px-1">Clearance Priority</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full pl-5 pr-10 py-3.5 bg-industrial-950/40 border border-white/5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest focus:border-brand-main/40 focus:ring-1 focus:ring-brand-main/20 transition-all appearance-none cursor-pointer outline-none"
                    >
                      <option value="viewer">LVL_1: Telemetry_Viewer</option>
                      <option value="operator">LVL_2: Command_Operator</option>
                      <option value="admin">LVL_3: System_Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-brand-main">
                      <svg className="w-4 h-4 fill-current opacity-50" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-premium w-full py-5 rounded-xl relative group overflow-hidden active:scale-95 transition-all">
                  <div className="relative z-10 flex items-center justify-center gap-4">
                    {loading ? (
                      <>
                        <Activity className="animate-spin text-brand-main" size={18} />
                        <span className="text-[11px] font-black text-white tracking-[0.3em]">PROVISIONING_NODE...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-black text-white tracking-[0.4em]">COMMIT_OPERATOR</span>
                        <div className="w-2 h-2 rounded-full bg-brand-main animate-pulse shadow-[0_0_8px_#b45309]" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] text-industrial-600 font-black uppercase tracking-widest">
                Authorized Node Existing?{" "}
                <Link to="/login" className="text-brand-main hover:text-white transition-all underline underline-offset-8 decoration-brand-main/30 hover:decoration-brand-main">
                  Secure Sign-In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-10 flex flex-col items-center gap-3 opacity-20">
          <div className="flex gap-4 items-center">
            <div className="h-px w-10 bg-industrial-800" />
            <p className="text-[8px] text-industrial-400 font-mono uppercase tracking-[0.4em]">Integrated Telemetry Engine v2.4</p>
            <div className="h-px w-10 bg-industrial-800" />
          </div>
        </div>
      </div>
    </div>
  );
};
