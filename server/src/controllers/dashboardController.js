import Loan from '../models/Loan.js';
import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const summary = asyncHandler(async (_req, res) => {
  const [agg] = await Loan.aggregate([
    {
      $group: {
        _id: null,
        disbursed: {
          $sum: {
            $cond: [{ $in: ['$status', ['disbursed', 'active', 'closed']] }, '$principal', 0],
          },
        },
        outstanding: { $sum: '$outstanding' },
        totalCollected: { $sum: '$totalPaid' },
        activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      },
    },
  ]);

  const now = new Date();
  const [overdueAgg] = await Loan.aggregate([
    { $unwind: '$schedule' },
    { $match: { 'schedule.status': { $ne: 'paid' }, 'schedule.dueDate': { $lt: now } } },
    {
      $group: {
        _id: null,
        amount: { $sum: { $subtract: ['$schedule.totalDue', '$schedule.amountPaid'] } },
      },
    },
  ]);

  const clientCount = await Client.countDocuments();
  const recentLoans = await Loan.find()
    .populate('client', 'name')
    .sort('-createdAt')
    .limit(6)
    .lean();

  res.json({
    disbursed: agg?.disbursed || 0,
    outstanding: agg?.outstanding || 0,
    collected: agg?.totalCollected || 0,
    overdue: overdueAgg?.amount || 0,
    activeLoans: agg?.activeCount || 0,
    pendingLoans: agg?.pendingCount || 0,
    clientCount,
    recentLoans,
  });
});
