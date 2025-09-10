const app = require('./app');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// For Vercel deployment - export the app directly
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  console.log('🚀 Starting in Vercel serverless mode...');
  module.exports = app;
} else {
  // For local development
  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STUDENT MANAGEMENT SYSTEM API');
    console.log('='.repeat(60));
    console.log(`📊 Environment: ${NODE_ENV.toUpperCase()}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`⚡ API Base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
    console.log('📋 Available Endpoints:');
    console.log('   📝 Auth: /api/auth/*');
    console.log('   👥 Students: /api/students/*');
    console.log('   📧 Email Verification: /api/auth/verify-student/:token');
    console.log('   🔑 Password Reset: /api/auth/reset-password/:token');
    console.log('='.repeat(60));
    console.log(`✅ Server successfully started at ${new Date().toLocaleString()}`);
    console.log('='.repeat(60) + '\n');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
      console.log('💤 Process terminated');
    });
  });
}
