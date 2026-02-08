// Import User model to interact with users collection
const User = require('../models/User');
// Import token generation utility
const generateToken = require('../utils/generateToken');
// Import express-validator for input validation
const { validationResult } = require('express-validator');

// ==========================================
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
// ==========================================
const registerUser = async (req, res) => {
  try {
    // 1. CHECK FOR VALIDATION ERRORS
    // validationResult checks if data passed validation rules (we'll define in routes)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation failed, return 400 Bad Request with error messages
      return res.status(400).json({
        success: false,
        errors: errors.array(),  // Array of validation error messages
      });
    }

    // 2. EXTRACT DATA FROM REQUEST BODY
    // Destructuring: pull these fields from req.body
    const { name, email, password, phone, dateOfBirth, address, role } = req.body;

    // 3. CHECK IF USER ALREADY EXISTS
    // Search database for user with this email
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If email already registered, return 400 error
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // 4. CREATE NEW USER
    // User.create() saves new user to database
    // Password will be automatically hashed by the pre-save middleware in User model
    const user = await User.create({
      name,
      email,
      password,  // Plain password - will be hashed automatically
      phone,
      dateOfBirth,
      address,
      role: role || 'customer',  // If role not provided, default to 'customer'
    });

    // 5. GENERATE JWT TOKEN
    // Pass user's ID to generate token
    const token = generateToken(user._id);

    // 6. SEND RESPONSE
    // Return 201 Created with token and user info
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,  // JWT token for authentication
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // 7. HANDLE ERRORS
    console.error('Error in registerUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// ==========================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ==========================================
const loginUser = async (req, res) => {
  try {
    // 1. CHECK VALIDATION ERRORS
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // 2. EXTRACT EMAIL AND PASSWORD
    const { email, password } = req.body;

    // 3. FIND USER BY EMAIL
    // .select('+password') because password field has 'select: false' in model
    // We need password to compare with entered password
    const user = await User.findOne({ email }).select('+password');

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. CHECK IF ACCOUNT IS ACTIVE
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    // 5. VERIFY PASSWORD
    // Use the comparePassword method we created in User model
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      // If password doesn't match
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 6. GENERATE TOKEN
    const token = generateToken(user._id);

    // 7. SEND RESPONSE
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// ==========================================
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (requires token)
// ==========================================
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware (we'll create this next)
    // It contains the user ID from the decoded token
    
    // Find user by ID (excluding password field)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Send user data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


