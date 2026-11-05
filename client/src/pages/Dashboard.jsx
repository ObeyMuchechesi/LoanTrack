import { Link } from 'react-router-dom';
import api from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { withShare } from '../utils/share.js';
import { useLoad } from '../utils/useLoad.js';

const fmt = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function Dashboard() {
  const { data: d, error, loading, reload } = useLoad(
    () => api.get('/dashboard/summary').then((r) => r.data)
  );

  if (!d && loading) return <p className="text-slate-500">Loading...</p>;
  if (!d) return (
    <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-lg p-4">
      {error || 'Could not load the dashboard.'}
      <button onClick={reload} className="ml-3 underline">Retry</button>
    </div>
  );

  const recent = Array.isArray(d.recentLoans) ? d.recentLoans : [];

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error} <button onClick={reload} className="underline ml-2">Retry</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link to={withShare('/loans/new')} className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg">
          + New Loan
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Disbursed" value={fmt(d.disbursed)} />
        <StatCard label="Outstanding" value={fmt(d.outstanding)} />
        <StatCard label="Collected" value={fmt(d.collected)} tone="ok" />
        <StatCard label="Portfolio at Risk (Overdue)" value={fmt(d.overdue)} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="Active Loans" value={d.activeLoans} />
        <StatCard label="Pending Approvals" value={d.pendingLoans} tone="warn" />
        <StatCard label="Total Clients" value={d.clientCount} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 font-medium">Recent loans</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Loan #</th>
              <th className="p-3">Client</th>
              <th className="p-3">Segment</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((l) => (
              <tr key={l._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <Link to={withShare(`/loans/${l._id}`)} className="text-brand-600 hover:underline font-medium">
                    {l.loanNo}
                  </Link>
                </td>
                <td className="p-3">{l.client?.name}</td>
                <td className="p-3"><Badge status={l.segment} /></td>
                <td className="p-3">{fmt(l.principal)}</td>
                <td className="p-3"><Badge status={l.status} /></td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-slate-400">No loans yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
