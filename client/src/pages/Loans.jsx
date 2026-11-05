import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import Badge from '../components/Badge.jsx';

const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const statuses = ['', 'pending', 'approved', 'disbursed', 'active', 'closed', 'rejected'];

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    api.get(`/loans?${params}`).then((r) => setLoans(r.data));
  };
  useEffect(() => { load(); }, [status, q]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Loans</h1>
        <Link to="/loans/new" className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg">+ New Loan</Link>
      </div>

      <div className="flex gap-3">
        <input placeholder="Search loan # or client..." value={q} onChange={(e) => setQ(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 bg-white w-64" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 bg-white">
          {statuses.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Loan #</th>
              <th className="p-3">Client</th>
              <th className="p-3">Segment</th>
              <th className="p-3">Principal</th>
              <th className="p-3">Outstanding</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3"><Link to={`/loans/${l._id}`} className="text-brand-600 hover:underline font-medium">{l.loanNo}</Link></td>
                <td className="p-3">{l.client?.name}</td>
                <td className="p-3"><Badge status={l.segment} /></td>
                <td className="p-3">{fmt(l.principal)}</td>
                <td className="p-3">{fmt(l.outstanding)}</td>
                <td className="p-3"><Badge status={l.status} /></td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-400">No loans</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
