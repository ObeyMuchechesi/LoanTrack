import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function NewLoan() {
  const nav = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    client: '', product: '', principal: 1000, numberOfInstallments: 12,
    firstDueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), remarks: '',
  });

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/products')]).then(([c, p]) => {
      setClients(c.data);
      setProducts(p.data.filter((x) => x.active));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/loans', { ...form, principal: +form.principal, numberOfInstallments: +form.numberOfInstallments });
      nav(`/loans/${data._id}`);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to create loan');
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">New Loan</h1>
      {err && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2 mb-3">{err}</div>}
      <form onSubmit={submit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
        <div>
          <label className="text-sm font-medium">Client</label>
          <select required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1">
            <option value="">Select client...</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.clientNo})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Product</label>
          <select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1">
            <option value="">Select product...</option>
            {products.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.interestType} @ {p.annualRate}%</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Principal</label>
            <input type="number" required value={form.principal} min={1}
              onChange={(e) => setForm({ ...form, principal: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium"># Installments</label>
            <input type="number" required value={form.numberOfInstallments} min={1}
              onChange={(e) => setForm({ ...form, numberOfInstallments: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">First due date</label>
          <input type="date" required value={form.firstDueDate}
            onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Remarks</label>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1" rows={2} />
        </div>
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg">Create loan (pending approval)</button>
      </form>
    </div>
  );
}
