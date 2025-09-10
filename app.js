const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Load env vars
require('dotenv').config();

// Display startup information
console.log('⚙️  Initializing Student Management System API...');
console.log(`🔧 Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('📦 Loading application modules...');

// Route files
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');

const app = express();

console.log('🔗 Establishing database connection...');
// Connect to database
connectDB();

console.log('🛠️  Configuring middleware...');
// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🌐 Configuring CORS policy...');
// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://student-management-system-frontend-777.vercel.app',
        process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app',
        /\.vercel\.app$/,  // Allow all Vercel subdomains
        'https://localhost:3000'
      ]
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Added Vite dev server ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log('🔒 Security headers configured');
// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

console.log('🛣️  Setting up API routes...');
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

console.log('✅ Authentication routes: /api/auth/*');
console.log('✅ Student routes: /api/students/*');
console.log('🏥 Health check route: /api/health');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Management System API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

console.log('🔧 Configuring 404 handler...');
// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

console.log('🎯 Application configuration completed successfully!');
console.log('🚀 Ready to start server...\n');

module.exports = app;
