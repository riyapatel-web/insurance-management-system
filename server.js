// Load environment variables from .env file
require('dotenv').config();

// Import express
const express = require('express');
// Import CORS for cross-origin requests
const cors = require('cors');
// Import database connection
const connectDB = require('./src/config/db');
// Import error middleware
const errorHandler = require('./src/middlewares/errorMiddleware');

// Import routes
const authRoutes = require('./src/routes/authRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB database
connectDB();

// ==========================================
// MIDDLEWARES
// ==========================================

// Enable CORS (allow frontend to connect)
app.use(cors());

// Parse JSON bodies (enable req.body)
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ==========================================
// ROUTES
// ==========================================

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Insurance Management API is running!',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// ==========================================
// ERROR HANDLING (must be last)
// ==========================================
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Server running on port ${PORT}
  📝 Mode: ${process.env.NODE_ENV || 'development'}
  ==========================================
  `);
});