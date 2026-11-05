const PERIODS_PER_YEAR = { daily: 365, weekly: 52, biweekly: 26, monthly: 12, quarterly: 4 };

export function addPeriod(date, frequency, n) {
  const d = new Date(date);
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + n); break;
    case 'weekly': d.setDate(d.getDate() + n * 7); break;
    case 'biweekly': d.setDate(d.getDate() + n * 14); break;
    case 'monthly': d.setMonth(d.getMonth() + n); break;
    case 'quarterly': d.setMonth(d.getMonth() + n * 3); break;
  }
  return d;
}

const round = (n) => Math.round(n * 100) / 100;

export function buildSchedule({
  principal,
  annualRate,
  interestType,
  frequency,
  numberOfInstallments,
  firstDueDate,
}) {
  const periodsPerYear = PERIODS_PER_YEAR[frequency];
  const periodicRate = annualRate / 100 / periodsPerYear;
  const schedule = [];
  let totalInterest = 0;

  if (interestType === 'flat') {
    const termYears = numberOfInstallments / periodsPerYear;
    totalInterest = principal * (annualRate / 100) * termYears;
    const perInt = totalInterest / numberOfInstallments;
    const perPrin = principal / numberOfInstallments;
    for (let i = 0; i < numberOfInstallments; i++) {
      schedule.push({
        no: i + 1,
        dueDate: addPeriod(firstDueDate, frequency, i),
        principalDue: round(perPrin),
        interestDue: round(perInt),
        totalDue: round(perPrin + perInt),
      });
    }
  } else {
    let emi;
    if (periodicRate === 0) {
      emi = principal / numberOfInstallments;
    } else {
      const p = Math.pow(1 + periodicRate, numberOfInstallments);
      emi = (principal * periodicRate * p) / (p - 1);
    }
    let balance = principal;
    for (let i = 0; i < numberOfInstallments; i++) {
      const interest = balance * periodicRate;
      let principalPortion = emi - interest;
      if (i === numberOfInstallments - 1) principalPortion = balance;
      balance = round(balance - principalPortion);
      totalInterest += interest;
      schedule.push({
        no: i + 1,
        dueDate: addPeriod(firstDueDate, frequency, i),
        principalDue: round(principalPortion),
        interestDue: round(interest),
        totalDue: round(principalPortion + interest),
      });
    }
  }

  const totalPayable = round(schedule.reduce((s, i) => s + i.totalDue, 0));
  return {
    schedule,
    totalInterest: round(totalInterest),
    totalPayable,
    maturityDate: schedule[schedule.length - 1]?.dueDate,
  };
}
