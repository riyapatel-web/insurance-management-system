// Import jsonwebtoken to verify tokens
const jwt = require('jsonwebtoken');
// Import User model to fetch user details
const User = require('../models/User');

// ==========================================
// @desc    Protect routes - verify JWT token
// @access  Used in protected routes
// ==========================================
const protect = async (req, res, next) => {
  let token;

  try {
    // 1. CHECK IF TOKEN EXISTS IN HEADERS
    // Authorization header format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from header
      // Split "Bearer token" and take the token part (index 1)
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    // 2. VERIFY TOKEN
    // jwt.verify() checks if token is valid and not expired
    // If valid, it decodes the payload (returns { id, iat, exp })
    // If invalid/expired, it throws an error (caught by catch block)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded looks like:
    // {
    //   id: "65c123456789abcdef012345",  // User ID we put in token
    //   iat: 1709876543,                 // Issued at timestamp
    //   exp: 1712468543                  // Expiration timestamp
    // }

    // 3. FETCH USER FROM DATABASE
    // Find user by ID from decoded token
    // .select('-password') excludes password from result
    const user = await User.findById(decoded.id).select('-password');

    // If user not found (deleted/deactivated after token was issued)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // 4. ATTACH USER TO REQUEST OBJECT
    // Now all controllers after this middleware can access req.user
    req.user = user;

    // 5. PROCEED TO NEXT MIDDLEWARE/CONTROLLER
    // Call next() to pass control to the next function in the chain
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error.message);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      // Token is malformed or invalid
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      // Token has expired
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message,
    });
  }
};

// ==========================================
// @desc    Authorize roles - check user role
// @access  Used after protect middleware
// ==========================================
// This is a higher-order function (function that returns a function)
const authorize = (...roles) => {
  // roles = ['admin', 'agent'] - array of allowed roles
  
  return (req, res, next) => {
    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    
    // If role is allowed, proceed
    next();
  };
};

// Export both middlewares
module.exports = {
  protect,
  authorize,
};
