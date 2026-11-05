/**
 * Returns the accrued penalty for an installment based on days overdue.
 * Penalty = penaltyPctPerDay% * totalDue * daysOverdue
 */
export function computePenalty(installment, penaltyPctPerDay) {
  if (!penaltyPctPerDay || installment.status === 'paid') return 0;
  const today = new Date();
  const due = new Date(installment.dueDate);
  if (due >= today) return 0;
  const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  const remaining = installment.totalDue - installment.amountPaid;
  if (remaining <= 0) return 0;
  return Math.round(remaining * (penaltyPctPerDay / 100) * daysOverdue * 100) / 100;
}

export function decorateSchedule(schedule, penaltyPctPerDay) {
  const today = new Date();
  return schedule.map((i) => {
    const overdue = i.status !== 'paid' && new Date(i.dueDate) < today;
    const daysOverdue = overdue
      ? Math.floor((today - new Date(i.dueDate)) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      ...i.toObject ? i.toObject() : i,
      overdue,
      daysOverdue,
      penalty: computePenalty(i, penaltyPctPerDay),
    };
  });
}
