import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';

export const list = asyncHandler(async (_req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json(users);
});

export const create = asyncHandler(async (req, res) => {
  const { name, email, password, role, branch } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const user = await User.create({ name, email, password, role, branch });
  await logActivity({ actor: req.user._id, action: 'user.create', entityType: 'User', entityId: user._id });
  const safe = user.toObject();
  delete safe.password;
  res.status(201).json(safe);
});

export const update = asyncHandler(async (req, res) => {
  const { name, role, branch, active, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (name) user.name = name;
  if (role) user.role = role;
  if (branch) user.branch = branch;
  if (active !== undefined) user.active = active;
  if (password) user.password = password;
  await user.save();
  res.json(user);
});
