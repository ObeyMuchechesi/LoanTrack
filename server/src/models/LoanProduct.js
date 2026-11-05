import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    segment: { type: String, enum: ['micro', 'macro'], required: true },
    interestType: { type: String, enum: ['flat', 'reducing'], default: 'reducing' },
    annualRate: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'],
      required: true,
    },
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number, default: 0 },
    minTermMonths: { type: Number, default: 1 },
    maxTermMonths: { type: Number, default: 60 },
    processingFeePct: { type: Number, default: 0 },
    penaltyPctPerDay: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('LoanProduct', productSchema);
