import mongoose from 'mongoose';
import { makeNumber } from '../utils/ids.js';

const allocationSchema = new mongoose.Schema(
  {
    installmentId: mongoose.Schema.Types.ObjectId,
    principal: Number,
    interest: Number,
    amount: Number,
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank', 'mobile_money', 'cheque'], default: 'cash' },
    reference: String,
    paidAt: { type: Date, default: Date.now },
    allocations: [allocationSchema],
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function (next) {
  if (!this.receiptNo) {
    this.receiptNo = makeNumber('RC');
  }
  next();
});

export default mongoose.model('Payment', paymentSchema);
