import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
