const mongoose = require('mongoose');
const path = require('path');
const Student = require('../models/Student');
const User = require('../models/User');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const syncVerificationStatus = async () => {
  try {
    console.log('🔄 Starting verification status synchronization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all verified students whose users are not marked as email verified
    const verifiedStudents = await Student.find({ 
      isVerified: true 
    }).populate('userId');

    console.log(`📊 Found ${verifiedStudents.length} verified students`);

    let syncCount = 0;
    for (const student of verifiedStudents) {
      if (student.userId && !student.userId.isEmailVerified) {
        student.userId.isEmailVerified = true;
        await student.userId.save();
        syncCount++;
        console.log(`✅ Synced verification for ${student.name} (${student.email})`);
      }
    }

    // Also sync the other way - if user is email verified but student is not verified
    const emailVerifiedUsers = await User.find({ 
      isEmailVerified: true,
      role: 'student'
    });

    for (const user of emailVerifiedUsers) {
      const student = await Student.findOne({ userId: user._id });
      if (student && !student.isVerified) {
        student.isVerified = true;
        await student.save();
        syncCount++;
        console.log(`✅ Synced student verification for ${student.name} (${student.email})`);
      }
    }

    console.log(`🎉 Synchronization complete! Updated ${syncCount} records`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
};

// Run the sync if this file is executed directly
if (require.main === module) {
  syncVerificationStatus();
}

module.exports = syncVerificationStatus;
