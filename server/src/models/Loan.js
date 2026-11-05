import mongoose from 'mongoose';
import { makeNumber } from '../utils/ids.js';

const installmentSchema = new mongoose.Schema(
  {
    no: Number,
    dueDate: Date,
    principalDue: Number,
    interestDue: Number,
    totalDue: Number,
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    paidAt: Date,
  },
  { _id: true }
);

const loanSchema = new mongoose.Schema(
  {
    loanNo: { type: String, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanProduct', required: true },
    segment: { type: String, enum: ['micro', 'macro'], required: true },
    principal: { type: Number, required: true },
    annualRate: { type: Number, required: true },
    interestType: { type: String, enum: ['flat', 'reducing'], required: true },
    frequency: { type: String, required: true },
    numberOfInstallments: { type: Number, required: true },
    processingFee: { type: Number, default: 0 },
    disbursementDate: Date,
    firstDueDate: Date,
    maturityDate: Date,
    totalInterest: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    schedule: [installmentSchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'disbursed', 'active', 'closed', 'defaulted', 'written_off'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    remarks: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

loanSchema.pre('save', async function (next) {
  if (!this.loanNo) {
    this.loanNo = makeNumber('LN');
  }
  next();
});

export default mongoose.model('Loan', loanSchema);
