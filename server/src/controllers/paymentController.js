import Payment from '../models/Payment.js';
import { applyPayment } from '../services/paymentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';

export const create = asyncHandler(async (req, res) => {
  const { loanId, amount, method, reference, notes } = req.body;
  const payment = await applyPayment({
    loanId,
    amount: Number(amount),
    method,
    reference,
    notes,
    collectedBy: req.user._id,
  });
  await logActivity({ actor: req.user._id, action: 'payment.create', entityType: 'Payment', entityId: payment._id });
  res.status(201).json(payment);
});

export const list = asyncHandler(async (req, res) => {
  const { loan } = req.query;
  const filter = loan ? { loan } : {};
  const payments = await Payment.find(filter)
    .populate('loan', 'loanNo')
    .populate('client', 'name')
    .populate('collectedBy', 'name')
    .sort('-paidAt')
    .limit(200);
  res.json(payments);
});
