const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📍 Database Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    console.error('❌ Database Connection Failed!');
    console.error(`🚨 Error: ${error.message}`);
    console.error('💥 Server shutting down due to database connection failure...');
    process.exit(1);
  }
};

module.exports = connectDB;
