import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const empty = {
  name: '', segment: 'micro', interestType: 'flat', annualRate: 24, frequency: 'weekly',
  minAmount: 100, maxAmount: 5000, processingFeePct: 2, penaltyPctPerDay: 0.1, active: true,
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/products').then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post('/products', form);
    setOpen(false);
    setForm(empty);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Loan Products</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setOpen(true)} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg">
            + New Product
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between items-start">
              <div className="font-medium">{p.name}</div>
              <Badge status={p.segment} />
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {p.interestType} · {p.annualRate}% p.a. · {p.frequency}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {p.minAmount?.toLocaleString()} - {p.maxAmount?.toLocaleString()}
            </div>
            {p.processingFeePct > 0 && (
              <div className="text-xs text-slate-400 mt-1">Fee {p.processingFeePct}%</div>
            )}
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New product" wide>
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 sm:col-span-2" />
          <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2">
            <option value="micro">Micro</option>
            <option value="macro">Macro</option>
          </select>
          <select value={form.interestType} onChange={(e) => setForm({ ...form, interestType: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2">
            <option value="flat">Flat</option>
            <option value="reducing">Reducing</option>
          </select>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2">
            {['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input type="number" placeholder="Annual rate %" value={form.annualRate}
            onChange={(e) => setForm({ ...form, annualRate: +e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2" />
          <input type="number" placeholder="Min amount" value={form.minAmount}
            onChange={(e) => setForm({ ...form, minAmount: +e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2" />
          <input type="number" placeholder="Max amount" value={form.maxAmount}
            onChange={(e) => setForm({ ...form, maxAmount: +e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2" />
          <input type="number" step="0.01" placeholder="Processing fee %" value={form.processingFeePct}
            onChange={(e) => setForm({ ...form, processingFeePct: +e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2" />
          <input type="number" step="0.01" placeholder="Penalty %/day" value={form.penaltyPctPerDay}
            onChange={(e) => setForm({ ...form, penaltyPctPerDay: +e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2" />
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
