import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#382810_0%,_transparent_70%)] opacity-30 glow-breathing" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-industrial-900)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-industrial-900)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      <div className="industrial-grid absolute inset-0 opacity-10" />
      <div className="scanline" />
      
      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-1000 slide-in-from-bottom-8">
        {/* Glow behind the card */}
        <div className="absolute -inset-2 bg-brand-500/5 blur-2xl rounded-3xl" />
        
        {/* Corner Brackets (Mechanical feel) */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-brand-500/40 rounded-tl-sm" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-brand-500/40 rounded-tr-sm" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-brand-500/40 rounded-bl-sm" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-brand-500/40 rounded-br-sm" />

        <div className="bg-industrial-950/80 backdrop-blur-2xl border border-brand-500/20 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle metal texture or noise overlay if we had one, but keeping it clean with glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] to-transparent pointer-events-none" />
          
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-brand-950 to-industrial-900 border border-brand-500/30 mb-5 shadow-[0_0_20px_rgba(168,121,50,0.2)]">
                <Lock size={28} className="text-brand-500 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-widest mb-1">
                <span className="opacity-80">FACTORY</span>{" "}
                <span className="text-brand-500">FORGE</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-4 bg-brand-800" />
                <p className="text-brand-600 text-[10px] font-mono font-medium uppercase tracking-[0.3em]">Security Protocol 1.0</p>
                <div className="h-[1px] w-4 bg-brand-800" />
              </div>
            </div>

            {error && (
              <div className="mb-8 p-3 bg-red-950/20 border-l-2 border-red-600 rounded flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider text-left">Access Violation</h4>
                  <p className="text-[11px] text-red-300/70 mt-0.5 text-left leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-bold text-brand-700 uppercase tracking-[0.1em] group-focus-within:text-brand-500 transition-colors">
                      Operator ID
                    </label>
                    <span className="text-[9px] text-industrial-600 font-mono">REQ_OPER_ID</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={16} className="text-brand-900 group-focus-within:text-brand-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black/60 border border-brand-900/40 rounded-lg text-brand-50 placeholder-brand-900/30 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 focus:bg-black/80 transition-all duration-300 outline-none text-sm"
                      placeholder="Identitas Operator"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-bold text-brand-700 uppercase tracking-[0.1em] group-focus-within:text-brand-500 transition-colors">
                      Security Code
                    </label>
                    <span className="text-[9px] text-industrial-600 font-mono">ENC_PWD_B3</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={16} className="text-brand-900 group-focus-within:text-brand-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black/60 border border-brand-900/40 rounded-lg text-brand-50 placeholder-brand-900/30 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 focus:bg-black/80 transition-all duration-300 outline-none text-sm"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group p-[1px] rounded-lg overflow-hidden transition-all active:scale-[0.98]"
                >
                  {/* Animated Border Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600 group-hover:animate-pulse" />
                  
                  <div className="relative flex items-center justify-center gap-3 rounded-lg bg-industrial-950 px-6 py-3.5 transition-all group-hover:bg-transparent">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-brand-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-[11px] font-bold text-white tracking-[0.2em]">VERIFYING...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold text-brand-100 tracking-[0.2em] group-hover:text-white transition-colors uppercase">
                          Initiate Session
                        </span>
                        <div className="h-1 w-1 rounded-full bg-brand-500 group-hover:animate-ping shadow-[0_0_8px_#a87932]" />
                      </>
                    )}
                    
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-brand-500/10 text-center">
              <p className="text-[11px] text-brand-600 font-medium">
                Authorized Personnel Only.{' '}
                <Link to="/register" className="text-brand-500 hover:text-brand-400 font-bold transition-all underline decoration-brand-900/30 underline-offset-4 hover:decoration-brand-400">
                  Request Key
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-30 group grayscale hover:grayscale-0 transition-all duration-500">
           <div className="h-[1px] w-12 bg-industrial-800" />
           <p className="text-[9px] text-industrial-500 font-mono uppercase tracking-[0.3em]">
             Est. 2026 • Core v2.4
           </p>
           <div className="h-[1px] w-12 bg-industrial-800" />
        </div>
      </div>
    </div>
  );
};
