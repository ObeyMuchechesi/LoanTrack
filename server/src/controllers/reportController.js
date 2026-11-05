import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const agingBuckets = asyncHandler(async (_req, res) => {
  const now = new Date();
  const buckets = { '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, current: 0 };
  const loans = await Loan.find({ status: { $in: ['disbursed', 'active', 'defaulted'] } }).lean();
  for (const loan of loans) {
    for (const inst of loan.schedule) {
      if (inst.status === 'paid') continue;
      const overdueDays = Math.floor((now - new Date(inst.dueDate)) / 86400000);
      const remaining = inst.totalDue - inst.amountPaid;
      if (overdueDays <= 0) buckets.current += remaining;
      else if (overdueDays <= 30) buckets['1-30'] += remaining;
      else if (overdueDays <= 60) buckets['31-60'] += remaining;
      else if (overdueDays <= 90) buckets['61-90'] += remaining;
      else buckets['90+'] += remaining;
    }
  }
  res.json(buckets);
});

export const collectionsByDay = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.paidAt = {};
    if (from) match.paidAt.$gte = new Date(from);
    if (to) match.paidAt.$lte = new Date(to);
  }
  const data = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(data.map((d) => ({ date: d._id, total: d.total, count: d.count })));
});

export const portfolioBySegment = asyncHandler(async (_req, res) => {
  const data = await Loan.aggregate([
    { $match: { status: { $in: ['disbursed', 'active', 'closed', 'defaulted'] } } },
    {
      $group: {
        _id: '$segment',
        disbursed: { $sum: '$principal' },
        outstanding: { $sum: '$outstanding' },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});
