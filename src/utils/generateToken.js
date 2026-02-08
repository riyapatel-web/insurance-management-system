// Import jsonwebtoken package to create JWT tokens
const jwt = require('jsonwebtoken');

// Function to generate JWT token for a user
// Takes userId as parameter
const generateToken = (userId) => {
  // jwt.sign() creates and returns a token
  return jwt.sign(
    // PAYLOAD: Data to encode in the token
    { id: userId },  // We're storing user's ID in the token
    
    // SECRET KEY: Used to sign the token (from .env file)
    // This proves the token came from our server
    process.env.JWT_SECRET,
    
    // OPTIONS: Additional settings for the token
    {
      expiresIn: process.env.JWT_EXPIRE,  // Token expiration time (from .env: '30d')
    }
  );
};

// Export the function so we can use it in controllers
module.exports = generateToken;