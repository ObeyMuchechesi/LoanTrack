import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import Modal from '../components/Modal.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad, errorMessage } from '../utils/useLoad.js';

const fmt = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

export default function LoanDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad(async () => {
    const [loanRes, paymentRes] = await Promise.all([
      api.get(`/loans/${id}`),
      api.get(`/payments?loan=${id}`),
    ]);
    return { loan: loanRes.data, payments: paymentRes.data || [] };
  }, [id]);

  const act = async (action, body) => {
    setErr('');
    setBusy(true);
    try {
      await api.patch(`/loans/${id}/${action}`, body);
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.post('/payments', { loanId: id, amount: +amount, method });
      setPayOpen(false);
      setAmount('');
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const loan = data?.loan;
  if (!loan && loading) return <p className="text-slate-500">Loading...</p>;
  if (!loan) return (
    <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-lg p-4">
      {error || 'Could not load this loan.'}
      <button onClick={reload} className="ml-3 underline">Retry</button>
    </div>
  );

  const schedule = Array.isArray(loan.schedule) ? loan.schedule : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const canApprove = user?.role === 'admin' && loan.status === 'pending';
  const canDisburse = ['admin', 'officer'].includes(user?.role) && loan.status === 'approved';
  const canPay = ['admin', 'officer', 'collector'].includes(user?.role) && ['disbursed', 'active'].includes(loan.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{loan.loanNo}</h1>
          <div className="text-slate-500">{loan.client?.name} · {loan.product?.name}</div>
        </div>
        <Badge status={loan.status} />
      </div>

      {(err || error) && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm rounded-lg p-2">
          {err || error} <button onClick={reload} className="underline ml-2">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Principal', loan.principal], ['Total Payable', loan.totalPayable], ['Paid', loan.totalPaid], ['Outstanding', loan.outstanding]].map(([k, v]) => (
          <div key={k} className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="text-lg font-semibold mt-1">{fmt(v)}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {canApprove && (
          <>
            <button disabled={busy} onClick={() => act('approve')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">Approve</button>
            <button disabled={busy} onClick={() => act('reject', { reason: 'Rejected by admin' })} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">Reject</button>
          </>
        )}
        {canDisburse && (
          <button disabled={busy} onClick={() => act('disburse')} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60">Disburse</button>
        )}
        {canPay && (
          <button onClick={() => setPayOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">Record Payment</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b font-medium">Repayment schedule</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Due date</th>
              <th className="p-3">Principal</th>
              <th className="p-3">Interest</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Penalty</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((i, idx) => (
              <tr key={i._id || idx} className="border-t border-slate-100">
                <td className="p-3">{i.no}</td>
                <td className="p-3">{new Date(i.dueDate).toLocaleDateString()}</td>
                <td className="p-3">{fmt(i.principalDue)}</td>
                <td className="p-3">{fmt(i.interestDue)}</td>
                <td className="p-3">{fmt(i.totalDue)}</td>
                <td className="p-3">{fmt(i.amountPaid)}</td>
                <td className="p-3 text-red-600">{i.penalty > 0 ? fmt(i.penalty) : '-'}</td>
                <td className="p-3"><Badge status={i.overdue ? 'overdue' : i.status} /></td>
              </tr>
            ))}
            {schedule.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-slate-400">No schedule available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b font-medium">Payments</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="p-3">Receipt</th>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-xs">{p.receiptNo}</td>
                <td className="p-3">{new Date(p.paidAt).toLocaleDateString()}</td>
                <td className="p-3">{fmt(p.amount)}</td>
                <td className="p-3">{p.method}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record payment">
        <form onSubmit={submitPayment} className="space-y-3">
          <input type="number" step="0.01" required min={0.01} placeholder="Amount" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2">
            {['cash', 'bank', 'mobile_money', 'cheque'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button type="submit" disabled={busy} className="w-full bg-brand-600 text-white py-2 rounded-lg disabled:opacity-60">
            {busy ? 'Saving...' : 'Confirm'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
