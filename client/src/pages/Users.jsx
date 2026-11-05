import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'officer' });
  const [err, setErr] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/users', form);
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'officer' });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
    }
  };

  const toggle = async (u) => {
    await api.patch(`/users/${u._id}`, { active: !u.active });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button onClick={() => setOpen(true)} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-lg">+ New User</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {u.active ? 'active' : 'disabled'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => toggle(u)} className="text-brand-600 hover:underline text-sm">
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New user">
        <form onSubmit={save} className="space-y-3">
          {err && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2">{err}</div>}
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <input required type="password" minLength={6} placeholder="Password (min 6 chars)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2">
            {['admin', 'officer', 'collector', 'viewer'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg">Create</button>
        </form>
      </Modal>
    </div>
  );
}
