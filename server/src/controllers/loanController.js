import Loan from '../models/Loan.js';
import LoanProduct from '../models/LoanProduct.js';
import { buildSchedule } from '../services/loanService.js';
import { decorateSchedule } from '../services/penaltyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';

export const list = asyncHandler(async (req, res) => {
  const { status, segment, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (segment) filter.segment = segment;
  let query = Loan.find(filter).populate('client', 'name clientNo').sort('-createdAt').limit(200);
  const loans = await query;
  const filtered = q
    ? loans.filter((l) =>
        l.loanNo.toLowerCase().includes(q.toLowerCase()) ||
        (l.client?.name || '').toLowerCase().includes(q.toLowerCase()))
    : loans;
  res.json(filtered);
});

export const get = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id)
    .populate('client')
    .populate('product', 'name segment penaltyPctPerDay')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');
  if (!loan) return res.status(404).json({ message: 'Not found' });
  const obj = loan.toObject();
  obj.schedule = decorateSchedule(loan.schedule, loan.product?.penaltyPctPerDay || 0);
  res.json(obj);
});

export const create = asyncHandler(async (req, res) => {
  const { client, product: productId, principal, numberOfInstallments, firstDueDate, remarks } = req.body;
  const product = await LoanProduct.findById(productId);
  if (!product || !product.active) return res.status(400).json({ message: 'Invalid product' });
  if (principal <= 0) return res.status(400).json({ message: 'Invalid principal' });

  const built = buildSchedule({
    principal,
    annualRate: product.annualRate,
    interestType: product.interestType,
    frequency: product.frequency,
    numberOfInstallments,
    firstDueDate: new Date(firstDueDate),
  });

  const loan = await Loan.create({
    client,
    product: product._id,
    segment: product.segment,
    principal,
    annualRate: product.annualRate,
    interestType: product.interestType,
    frequency: product.frequency,
    numberOfInstallments,
    processingFee: Math.round(principal * (product.processingFeePct / 100) * 100) / 100,
    firstDueDate: new Date(firstDueDate),
    totalInterest: built.totalInterest,
    totalPayable: built.totalPayable,
    outstanding: built.totalPayable,
    maturityDate: built.maturityDate,
    schedule: built.schedule,
    status: 'pending',
    remarks,
    createdBy: req.user._id,
  });

  await logActivity({ actor: req.user._id, action: 'loan.create', entityType: 'Loan', entityId: loan._id });
  res.status(201).json(loan);
});

export const approve = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Not found' });
  if (loan.status !== 'pending') return res.status(400).json({ message: `Cannot approve from ${loan.status}` });
  loan.status = 'approved';
  loan.approvedBy = req.user._id;
  loan.approvedAt = new Date();
  await loan.save();
  await logActivity({ actor: req.user._id, action: 'loan.approve', entityType: 'Loan', entityId: loan._id });
  res.json(loan);
});

export const reject = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Not found' });
  if (!['pending', 'approved'].includes(loan.status))
    return res.status(400).json({ message: `Cannot reject from ${loan.status}` });
  loan.status = 'rejected';
  loan.remarks = req.body.reason || loan.remarks;
  await loan.save();
  res.json(loan);
});

export const disburse = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Not found' });
  if (loan.status !== 'approved')
    return res.status(400).json({ message: 'Loan must be approved first' });
  loan.status = 'disbursed';
  loan.disbursementDate = req.body.disbursementDate || new Date();
  await loan.save();
  await logActivity({ actor: req.user._id, action: 'loan.disburse', entityType: 'Loan', entityId: loan._id });
  res.json(loan);
});
