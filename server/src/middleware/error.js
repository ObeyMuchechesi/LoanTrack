export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err.message);

  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
  } else if (err.name === 'CastError' || err instanceof SyntaxError) {
    status = 400;
    message = 'Malformed request';
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  } else if (status === 500) {
    // Do not leak internal details for unexpected failures.
    message = 'Server error';
  }

  res.status(status).json({ message });
}
