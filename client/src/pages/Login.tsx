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
      const response = await fetch('http://localhost:3001/api/auth/login', {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-900)_0%,_transparent_70%)] opacity-20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Main Card Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-8">
        {/* Border Gradient Glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-brand-500/50 via-brand-900/10 to-transparent rounded-2xl blur-sm opacity-70" />
        
        <div className="bg-industrial-950/90 backdrop-blur-xl border border-brand-500/20 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-80" />
          
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-900/40 to-black border border-brand-500/30 mb-6 shadow-[0_0_30px_rgba(180,83,9,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
                <Lock size={36} className="text-brand-500 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
              </div>
              <h1 className="text-3xl font-bold text-brand-50 tracking-tight mb-2">
                FACTORY<span className="text-brand-500">FORGE</span>
              </h1>
              <p className="text-brand-800 text-xs font-mono uppercase tracking-[0.2em]">Secure Industrial Access</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-950/20 border-l-4 border-red-600 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-left-2">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400">Access Denied</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                    Operator ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-brand-800 group-focus-within:text-brand-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 placeholder-brand-900/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                      placeholder="Identitas Operator"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                    Security Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-brand-800 group-focus-within:text-brand-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 placeholder-brand-900/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-brand-700 p-[1px] transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <div className="relative flex items-center justify-center gap-2 rounded-xl bg-industrial-950 px-4 py-3.5 transition-all group-hover:bg-brand-950/90">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-brand-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-bold text-brand-100 tracking-widest">VERIFYING...</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-brand-100 tracking-widest group-hover:text-white transition-colors">
                      INITIATE SESSION
                    </span>
                  )}
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent" />
                </div>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-brand-900/20 text-center">
              <p className="text-sm text-brand-800">
                Authorized Personnel Only.{' '}
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-400 transition-colors">
                  Request Access
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-industrial-600 font-mono uppercase tracking-widest">
            System v2.4.0 • Encrypted Connection
          </p>
        </div>
      </div>
    </div>
  );
};
