export default function StatCard({ label, value, tone = 'brand', hint }) {
  const toneMap = {
    brand: 'text-brand-600',
    ok: 'text-emerald-600',
    warn: 'text-amber-600',
    danger: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneMap[tone] || toneMap.brand}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
