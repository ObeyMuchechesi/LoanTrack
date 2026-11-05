import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || 'loantrack-dev-secret-change-me';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Invalid user' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
  next();
};
