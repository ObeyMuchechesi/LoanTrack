const map = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  disbursed: 'bg-indigo-100 text-indigo-700',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-700',
  rejected: 'bg-red-100 text-red-700',
  defaulted: 'bg-red-100 text-red-700',
  written_off: 'bg-slate-300 text-slate-800',
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  verified: 'bg-emerald-100 text-emerald-700',
  individual: 'bg-slate-100 text-slate-700',
  business: 'bg-indigo-100 text-indigo-700',
  group: 'bg-purple-100 text-purple-700',
  micro: 'bg-pink-100 text-pink-700',
  macro: 'bg-blue-100 text-blue-700',
};

export default function Badge({ status, label }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {label || status}
    </span>
  );
}
