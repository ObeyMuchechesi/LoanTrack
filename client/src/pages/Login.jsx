import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@loantrack.io');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-brand-600 mb-1">LoanTrack</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to your account</p>
        {err && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2 mb-3">{err}</div>}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition"
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-xs text-slate-400 mt-4">Demo: admin@loantrack.io / admin123</p>
      </form>
    </div>
  );
}
