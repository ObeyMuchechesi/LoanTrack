import { useEffect, useState } from 'react';
import api from '../api/client.js';

const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function Reports() {
  const [aging, setAging] = useState({});
  const [collections, setCollections] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/reports/aging'),
      api.get('/reports/collections'),
      api.get('/reports/portfolio'),
    ]).then(([a, c, p]) => {
      setAging(a.data);
      setCollections(c.data);
      setPortfolio(p.data);
    });
  }, []);

  const buckets = [
    ['current', 'Current'],
    ['1-30', '1-30 days'],
    ['31-60', '31-60 days'],
    ['61-90', '61-90 days'],
    ['90+', '90+ days'],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="font-medium mb-3">Aging buckets (installments)</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {buckets.map(([k, label]) => (
            <div key={k} className={`p-4 rounded-lg border ${k === '90+' ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-lg font-semibold mt-1">{fmt(aging[k] || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="font-medium mb-3">Portfolio by segment</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Segment</th>
              <th className="p-3">Loans</th>
              <th className="p-3">Disbursed</th>
              <th className="p-3">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="p-3 capitalize">{p._id}</td>
                <td className="p-3">{p.count}</td>
                <td className="p-3">{fmt(p.disbursed)}</td>
                <td className="p-3">{fmt(p.outstanding)}</td>
              </tr>
            ))}
            {portfolio.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="font-medium mb-3">Collections by day</h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Payments</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {collections.slice(-15).reverse().map((c) => (
              <tr key={c.date} className="border-t border-slate-100">
                <td className="p-3">{c.date}</td>
                <td className="p-3">{c.count}</td>
                <td className="p-3">{fmt(c.total)}</td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-slate-400">No collections</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
