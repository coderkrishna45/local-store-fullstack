const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const production = process.env.NODE_ENV === 'production';
  let statusCode = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'That value is already in use';
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) statusCode = 500;
  if (statusCode >= 500) {
    console.error('Request failed', { method: req.method, statusCode, error: err.name });
    if (production) message = 'Server error';
  }

  res.status(statusCode).json({ message, ...(!production && { stack: err.stack }) });
};

module.exports = errorHandler;
