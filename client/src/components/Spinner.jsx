export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
