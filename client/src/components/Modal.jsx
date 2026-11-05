export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">X</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
