import mongoose from 'mongoose';
import { makeNumber } from '../utils/ids.js';

const memberSchema = new mongoose.Schema(
  { name: String, phone: String, nationalId: String },
  { _id: false }
);

const clientSchema = new mongoose.Schema(
  {
    clientNo: { type: String, unique: true },
    type: { type: String, enum: ['individual', 'business', 'group'], default: 'individual' },
    name: { type: String, required: true, trim: true },
    phone: String,
    email: String,
    nationalId: String,
    address: String,
    members: [memberSchema],
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    branch: { type: String, default: 'HQ' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

clientSchema.pre('save', async function (next) {
  if (!this.clientNo) {
    this.clientNo = makeNumber('CL');
  }
  next();
});

export default mongoose.model('Client', clientSchema);
