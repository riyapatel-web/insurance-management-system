// Global error handling middleware
// This catches all errors that occur in the app
const errorHandler = (err, req, res, next) => {
  // Log error to console for debugging
  console.error('Error:', err);

  // Set status code (use error's statusCode or default to 500)
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // Only show error stack in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;