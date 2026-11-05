import jwt from 'jsonwebtoken';

const FALLBACK = 'loantrack-dev-secret-change-me';

// Read the secret at call time rather than at module evaluation time.
// ESM evaluates imported modules before the importing module's body, so a
// module-level `process.env.JWT_SECRET` can be captured before dotenv loads.
const secret = () => process.env.JWT_SECRET || FALLBACK;

export const signToken = (id) =>
  jwt.sign({ id }, secret(), { expiresIn: process.env.JWT_EXPIRES || '7d' });

export const verifyToken = (token) => jwt.verify(token, secret());
