import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const secret = process.env.JWT_SECRET || 'loantrack-dev-secret-change-me';

const signToken = (id) =>
  jwt.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES || '7d' });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.active) return res.status(403).json({ message: 'Account disabled' });

  const token = signToken(user._id);
  const safe = user.toObject();
  delete safe.password;
  res.json({ token, user: safe });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});
