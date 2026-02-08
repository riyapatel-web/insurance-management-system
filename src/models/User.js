// Import mongoose to create database schema
const mongoose = require('mongoose');
// Import bcryptjs to hash passwords
const bcrypt = require('bcryptjs');

// Define User Schema (structure of user data in database)
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,           // Data type is String
      required: [true, 'Please add a name'],  // Field is mandatory
      trim: true,             // Remove whitespace from both ends
    },

    // User's email (unique identifier)
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,           // No two users can have same email
      lowercase: true,        // Convert to lowercase before saving
      trim: true,
      match: [              // Validate email format using regex
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    // User's password (will be hashed before saving)
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,          // Don't return password in queries by default
    },

    // User's phone number
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [               // Validate phone format (10 digits)
        /^[0-9]{10}$/,
        'Please add a valid 10-digit phone number',
      ],
    },

    // User's date of birth
    dateOfBirth: {
      type: Date,
      required: [true, 'Please add date of birth'],
    },

    // User's address
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },

    // User role in the system
    role: {
      type: String,
      enum: ['customer', 'agent', 'admin'],  // Only these 3 values allowed
      default: 'customer',                    // If not specified, set as customer
    },

    // For agents only - commission percentage
    commissionRate: {
      type: Number,
      default: 0,            // Default 0% for non-agents
      min: 0,
      max: 100,
    },

    // For agents only - assigned customers (array of customer IDs)
    assignedCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User model
        ref: 'User',                            // Links to User collection
      },
    ],

    // Account status
    isActive: {
      type: Boolean,
      default: true,         // Account is active by default
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// MIDDLEWARE: Hash password before saving to database
// This runs BEFORE the user document is saved
userSchema.pre('save', async function (next) {
  // Check if password field is modified
  // If user is just updating name/email, don't rehash password
  if (!this.isModified('password')) {
    next();  // Skip to next middleware
  }

  // Generate salt (random data added to password before hashing)
  // 10 = salt rounds (higher = more secure but slower)
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  // this.password = plain text password from user
  // After this line, this.password = hashed password
  this.password = await bcrypt.hash(this.password, salt);

  next();  // Continue to save the document
});

// CUSTOM METHOD: Compare entered password with hashed password
// This method will be available on all user instances
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare() checks if plain password matches hashed password
  // Returns true if match, false if not
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export User model
// 'User' = model name (collection will be 'users' in MongoDB)
// userSchema = structure we defined above
module.exports = mongoose.model('User', userSchema);