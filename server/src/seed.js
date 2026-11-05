import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Client from './models/Client.js';
import LoanProduct from './models/LoanProduct.js';
import Loan from './models/Loan.js';
import { buildSchedule } from './services/loanService.js';
import { connectDB } from './config/db.js';

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    LoanProduct.deleteMany({}),
    Loan.deleteMany({}),
  ]);

  console.log('Creating users...');
  const [admin, officer, collector] = await User.create([
    { name: 'Admin', email: 'admin@loantrack.io', password: 'admin123', role: 'admin' },
    { name: 'Officer Jane', email: 'officer@loantrack.io', password: 'officer123', role: 'officer' },
    { name: 'Collector Joe', email: 'collector@loantrack.io', password: 'collector123', role: 'collector' },
  ]);

  console.log('Creating products...');
  const [microDaily, microWeekly, macroMonthly] = await LoanProduct.create([
    {
      name: 'Micro Daily Flat',
      segment: 'micro',
      interestType: 'flat',
      annualRate: 24,
      frequency: 'daily',
      minAmount: 100,
      maxAmount: 2000,
      processingFeePct: 2,
      penaltyPctPerDay: 0.1,
    },
    {
      name: 'Micro Weekly Flat',
      segment: 'micro',
      interestType: 'flat',
      annualRate: 30,
      frequency: 'weekly',
      minAmount: 200,
      maxAmount: 5000,
      processingFeePct: 2,
      penaltyPctPerDay: 0.1,
    },
    {
      name: 'Macro Monthly Reducing',
      segment: 'macro',
      interestType: 'reducing',
      annualRate: 18,
      frequency: 'monthly',
      minAmount: 20000,
      maxAmount: 500000,
      processingFeePct: 1,
      penaltyPctPerDay: 0.05,
    },
  ]);

  console.log('Creating clients...');
  const clients = await Client.create([
    { type: 'individual', name: 'Alice Mwangi', phone: '0771000001', nationalId: '63-1234', branch: 'HQ', kycStatus: 'verified', createdBy: officer._id },
    { type: 'individual', name: 'Bob Nkosi', phone: '0771000002', nationalId: '63-5678', branch: 'HQ', kycStatus: 'verified', createdBy: officer._id },
    {
      type: 'group',
      name: 'Sunrise Women Group',
      phone: '0771000003',
      branch: 'HQ',
      kycStatus: 'verified',
      members: [
        { name: 'Grace', phone: '0771000010' },
        { name: 'Sarah', phone: '0771000011' },
        { name: 'Mary', phone: '0771000012' },
      ],
      createdBy: officer._id,
    },
    { type: 'business', name: 'Acme Traders Ltd', phone: '0771000004', email: 'acme@biz.io', branch: 'HQ', kycStatus: 'verified', createdBy: officer._id },
  ]);

  console.log('Creating loans...');
  const today = new Date();

  // Micro loan - active
  const s1 = buildSchedule({
    principal: 500,
    annualRate: microWeekly.annualRate,
    interestType: microWeekly.interestType,
    frequency: microWeekly.frequency,
    numberOfInstallments: 12,
    firstDueDate: new Date(today.getTime() + 7 * 86400000),
  });
  const loan1 = await Loan.create({
    client: clients[0]._id,
    product: microWeekly._id,
    segment: microWeekly.segment,
    principal: 500,
    annualRate: microWeekly.annualRate,
    interestType: microWeekly.interestType,
    frequency: microWeekly.frequency,
    numberOfInstallments: 12,
    processingFee: 10,
    firstDueDate: new Date(today.getTime() + 7 * 86400000),
    disbursementDate: new Date(today.getTime() - 30 * 86400000),
    totalInterest: s1.totalInterest,
    totalPayable: s1.totalPayable,
    outstanding: s1.totalPayable,
    maturityDate: s1.maturityDate,
    schedule: s1.schedule,
    status: 'active',
    approvedBy: admin._id,
    approvedAt: new Date(today.getTime() - 35 * 86400000),
    createdBy: officer._id,
  });

  // Macro loan - pending
  const s2 = buildSchedule({
    principal: 50000,
    annualRate: macroMonthly.annualRate,
    interestType: macroMonthly.interestType,
    frequency: macroMonthly.frequency,
    numberOfInstallments: 24,
    firstDueDate: new Date(today.getTime() + 30 * 86400000),
  });
  await Loan.create({
    client: clients[3]._id,
    product: macroMonthly._id,
    segment: macroMonthly.segment,
    principal: 50000,
    annualRate: macroMonthly.annualRate,
    interestType: macroMonthly.interestType,
    frequency: macroMonthly.frequency,
    numberOfInstallments: 24,
    processingFee: 500,
    firstDueDate: new Date(today.getTime() + 30 * 86400000),
    totalInterest: s2.totalInterest,
    totalPayable: s2.totalPayable,
    outstanding: s2.totalPayable,
    maturityDate: s2.maturityDate,
    schedule: s2.schedule,
    status: 'pending',
    createdBy: officer._id,
  });

  console.log('\nSeed complete.\n');
  console.log('Demo logins:');
  console.log('  admin@loantrack.io     / admin123');
  console.log('  officer@loantrack.io   / officer123');
  console.log('  collector@loantrack.io / collector123');
  console.log(`\nCreated 1 active micro loan: ${loan1.loanNo}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
