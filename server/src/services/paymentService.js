import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';

const round = (n) => Math.round(n * 100) / 100;

export async function applyPayment({ loanId, amount, method, reference, collectedBy, notes }) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw Object.assign(new Error('Loan not found'), { status: 404 });
  if (['closed', 'written_off', 'rejected'].includes(loan.status))
    throw Object.assign(new Error(`Cannot pay a ${loan.status} loan`), { status: 400 });
  if (amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });

  let remaining = amount;
  const allocations = [];

  for (const inst of loan.schedule) {
    if (remaining <= 0) break;
    if (inst.status === 'paid') continue;

    const due = round(inst.totalDue - inst.amountPaid);
    const applied = Math.min(due, remaining);
    if (applied <= 0) continue;

    const intRatio = inst.interestDue / inst.totalDue;
    const interestPart = round(applied * intRatio);
    const principalPart = round(applied - interestPart);

    inst.amountPaid = round(inst.amountPaid + applied);
    if (inst.amountPaid >= inst.totalDue - 0.01) {
      inst.status = 'paid';
      inst.paidAt = new Date();
    } else {
      inst.status = 'partial';
    }

    allocations.push({
      installmentId: inst._id,
      principal: principalPart,
      interest: interestPart,
      amount: round(applied),
    });
    remaining = round(remaining - applied);
  }

  if (remaining > 0.01)
    throw Object.assign(new Error(`Overpayment: ${remaining} exceeds outstanding balance`), { status: 400 });

  loan.totalPaid = round(loan.totalPaid + amount);
  loan.outstanding = round(loan.outstanding - amount);
  if (loan.outstanding <= 0.01) {
    loan.outstanding = 0;
    loan.status = 'closed';
  } else if (loan.status === 'disbursed') {
    loan.status = 'active';
  }
  await loan.save();

  const payment = await Payment.create({
    loan: loan._id,
    client: loan.client,
    amount,
    method,
    reference,
    collectedBy,
    notes,
    allocations,
  });

  return payment;
}
