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
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-industrial-800 rounded-xl shadow-2xl border border-industrial-700 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">NEW OPERATOR</h1>
            <p className="text-industrial-400">Register for system access</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-industrial-900 border border-industrial-700 rounded-lg text-white placeholder-industrial-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Choose username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-industrial-900 border border-industrial-700 rounded-lg text-white placeholder-industrial-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Create password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-500">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-industrial-900 border border-industrial-700 rounded-lg text-white placeholder-industrial-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-2">
                Role Request
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2.5 bg-industrial-900 border border-industrial-700 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="viewer">Viewer (Read Only)</option>
                <option value="operator">Operator (Manage Alerts)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-brown to-brand-500 hover:from-brand-brown-dark hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Registering...' : 'REQUEST ACCESS'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-industrial-400">
              Already have access?{' '}
              <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
