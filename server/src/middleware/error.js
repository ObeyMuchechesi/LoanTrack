export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err.message);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'Server error' });
}
