import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';

const round = (n) => Math.round(n * 100) / 100;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

export async function applyPayment({ loanId, amount, method, reference, collectedBy, notes }) {
  if (!loanId) throw badRequest('loanId is required');
  if (!Number.isFinite(amount) || amount <= 0) throw badRequest('Invalid amount');

  const loan = await Loan.findById(loanId);
  if (!loan) throw Object.assign(new Error('Loan not found'), { status: 404 });

  // Payments are only meaningful once funds have actually been disbursed.
  if (!['disbursed', 'active', 'defaulted'].includes(loan.status))
    throw badRequest(`Cannot pay a ${loan.status} loan`);

  let remaining = amount;
  const allocations = [];

  for (const inst of loan.schedule) {
    if (remaining <= 0) break;
    if (inst.status === 'paid') continue;

    const due = round(inst.totalDue - inst.amountPaid);
    const applied = Math.min(due, remaining);
    if (applied <= 0) continue;

    const intRatio = inst.totalDue > 0 ? inst.interestDue / inst.totalDue : 0;
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
    throw badRequest(`Overpayment: ${remaining} exceeds outstanding balance`);

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
