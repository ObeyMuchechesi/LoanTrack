import { useState } from 'react';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad, errorMessage } from '../utils/useLoad.js';

const empty = { type: 'individual', name: '', phone: '', email: '', nationalId: '', address: '' };

export default function Clients() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, error, loading, reload } = useLoad(
    () => api.get(`/clients?q=${encodeURIComponent(q)}`).then((r) => r.data),
    [q],
    []
  );
  const clients = Array.isArray(data) ? data : [];

  const save = async (e) => {
    e.preventDefault();
    setSaveErr('');
    setSaving(true);
    try {
      await api.post('/clients', form);
      setOpen(false);
      setForm(empty);
      reload();
    } catch (err) {
      setSaveErr(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const canCreate = ['admin', 'officer'].includes(user?.role);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        {canCreate && (
          <button onClick={() => setOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg">
            + New Client
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error} <button onClick={reload} className="underline ml-2">Retry</button>
        </div>
      )}

      <input
        placeholder="Search by name, phone, or client #..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 bg-white"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Client #</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Phone</th>
              <th className="p-3">KYC</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{c.clientNo}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3"><Badge status={c.type} /></td>
                <td className="p-3">{c.phone || '-'}</td>
                <td className="p-3"><Badge status={c.kycStatus} /></td>
              </tr>
            ))}
            {(clients.length === 0 || loading) && (
              <tr><td colSpan={5} className="p-4 text-center text-slate-400">{loading ? 'Loading...' : 'No clients'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New client" wide>
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {saveErr && <div role="alert" className="sm:col-span-2 bg-red-50 text-red-700 text-sm rounded-lg p-2">{saveErr}</div>}
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="group">Group</option>
          </select>
          <input
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <input
            placeholder="National ID"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={saving} className="bg-brand-600 text-white px-4 py-2 rounded-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
