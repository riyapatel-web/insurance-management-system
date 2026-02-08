// Import express to create router
const express = require('express');
// Import express-validator for input validation
const { body } = require('express-validator');
// Import auth controllers
const { registerUser, loginUser, getMe } = require('../controllers/authController');
// Import auth middleware (we'll create this next)
const { protect } = require('../middlewares/authMiddleware');

// Create router instance
// Router is like a mini-app that handles routes
const router = express.Router();

// ==========================================
// VALIDATION RULES
// ==========================================

// Validation for registration
const registerValidation = [
  // Name validation
  body('name')
    .trim()                                    // Remove spaces from start/end
    .notEmpty()                                // Must not be empty
    .withMessage('Name is required')           // Error message if validation fails
    .isLength({ min: 2, max: 50 })            // Length between 2-50 characters
    .withMessage('Name must be between 2 and 50 characters'),

  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()                                 // Check if valid email format
    .withMessage('Please provide a valid email')
    .normalizeEmail(),                         // Convert to lowercase, remove dots from Gmail

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })                     // Minimum 6 characters
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)  // Must have lowercase, uppercase, number
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Phone validation
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)                   // Exactly 10 digits
    .withMessage('Phone number must be 10 digits'),

  // Date of birth validation
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isDate()                                  // Check if valid date
    .withMessage('Please provide a valid date')
    .custom((value) => {
      // Custom validation: User must be at least 18 years old
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      return true;
    }),

  // Address validation
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^[0-9]{6}$/)                    // 6 digits for Indian pin code
    .withMessage('Zip code must be 6 digits'),

  // Role validation (optional field)
  body('role')
    .optional()                                // Field is optional
    .isIn(['customer', 'agent', 'admin'])     // Must be one of these values
    .withMessage('Role must be customer, agent, or admin'),
];

// Validation for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ==========================================
// ROUTES
// ==========================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (anyone can access)
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires authentication token)
router.get('/me', protect, getMe);

// Export router to use in server.js
module.exports = router;