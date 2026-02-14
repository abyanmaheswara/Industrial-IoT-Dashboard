import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
        return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto redirect to login after success
      navigate('/login');
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-900/40 to-black border border-brand-500/30 mb-4 shadow-[0_0_30px_rgba(180,83,9,0.3)]">
                <User size={28} className="text-brand-500 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
              </div>
              <h1 className="text-2xl font-bold text-brand-50 tracking-tight mb-1">
                NEW OPERATOR
              </h1>
              <p className="text-brand-800 text-xs font-mono uppercase tracking-[0.1em]">System Registration Protocol</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-950/20 border-l-4 border-red-600 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-left-2">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400">Request Denied</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-brand-800 group-focus-within:text-brand-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 placeholder-brand-900/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                      placeholder="Choose username"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                    <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-brand-800 group-focus-within:text-brand-500 transition-colors duration-300" />
                        </div>
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 placeholder-brand-900/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        />
                    </div>
                    </div>

                    <div className="group">
                    <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                        Confirm
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck size={18} className="text-brand-800 group-focus-within:text-brand-500 transition-colors duration-300" />
                        </div>
                        <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 placeholder-brand-900/40 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        />
                    </div>
                    </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-brand-400">
                    Role Request
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-4 py-3 bg-black/40 border border-brand-900/40 rounded-xl text-brand-50 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-300 appearance-none cursor-pointer hover:bg-black/60"
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="operator">Operator (Manage Alerts)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-brand-700 p-[1px] transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 mt-2"
              >
                <div className="relative flex items-center justify-center gap-2 rounded-xl bg-industrial-950 px-4 py-3 transition-all group-hover:bg-brand-950/90">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-brand-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-bold text-brand-100 tracking-widest">PROCESSING...</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-brand-100 tracking-widest group-hover:text-white transition-colors">
                      REQUEST ACCESS
                    </span>
                  )}
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-brand-900/20 text-center">
              <p className="text-sm text-brand-800">
                Already authorized?{' '}
                <Link to="/login" className="font-bold text-brand-600 hover:text-brand-400 transition-colors">
                  Sign In
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
