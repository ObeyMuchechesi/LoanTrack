import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

// Some hosting reverse proxies inject their own Authorization header for
// share-link access. A dedicated header keeps application JWTs unambiguous.
export const TOKEN_HEADER = 'x-loantrack-token';

export async function protect(req, res, next) {
  try {
    const custom = req.headers[TOKEN_HEADER];
    const header = req.headers.authorization || '';
    const token = custom
      ? String(custom).replace(/^Bearer\s+/i, '')
      : header.startsWith('Bearer ')
        ? header.slice(7)
        : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Invalid user' });

    req.user = user;
    next();
  } catch (err) {
    console.warn(`[auth] rejected token: ${err.name}: ${err.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
  next();
};
