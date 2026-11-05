import Activity from '../models/Activity.js';

export async function logActivity({ actor, action, entityType, entityId, meta }) {
  try {
    await Activity.create({ actor, action, entityType, entityId, meta });
  } catch (e) {
    console.warn('Activity log failed:', e.message);
  }
}
