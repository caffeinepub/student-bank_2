import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGetAllAccounts } from '../hooks/useQueries';
import { Loader2, GraduationCap, Shield, User } from 'lucide-react';

type LoginMode = 'admin' | 'user';

export default function LoginPage() {
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [mode, setMode] = useState<LoginMode>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: accounts } = useGetAllAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'admin') {
        if (username === 'admin' && password === 'admin') {
          loginAsAdmin();
        } else {
          setError('Invalid admin credentials. Use admin / admin');
        }
      } else {
        // User login: username = account number, password = account number
        if (username && password && username === password) {
          // Check if account exists
          const accountExists = accounts?.some(a => a.accountNumber === username);
          if (accountExists) {
            loginAsUser(username);
          } else {
            setError('Account number not found. Please contact admin.');
          }
        } else {
          setError('Invalid credentials. Username and password must match your account number.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-login flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'oklch(0.65 0.22 264)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'oklch(0.62 0.2 145)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'oklch(0.72 0.19 55)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.45 0.25 290))' }}>
            <img
              src="/assets/generated/logo.dim_256x256.png"
              alt="Student Bank"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <GraduationCap className="w-10 h-10 text-white hidden" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white">Student Bank</h1>
          <p className="text-white/60 text-sm mt-1">School Banking Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6 bg-white/10">
            <button
              type="button"
              onClick={() => { setMode('admin'); setError(''); setUsername(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === 'admin'
                  ? 'bg-white text-slate-800 shadow-sm rounded-xl'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setMode('user'); setError(''); setUsername(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === 'user'
                  ? 'bg-white text-slate-800 shadow-sm rounded-xl'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                {mode === 'admin' ? 'Username' : 'Account Number'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={mode === 'admin' ? 'admin' : 'Enter account number'}
                className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all text-sm"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'admin' ? 'admin' : 'Enter account number as password'}
                className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all text-sm"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {mode === 'user' && (
              <p className="text-white/50 text-xs text-center">
                Use your account number as both username and password
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, oklch(0.62 0.2 145), oklch(0.55 0.22 165))' }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
              ) : (
                `Login as ${mode === 'admin' ? 'Admin' : 'Student'}`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
