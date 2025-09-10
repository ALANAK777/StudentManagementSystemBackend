const mongoose = require('mongoose');
const path = require('path');
const Student = require('../models/Student');
const User = require('../models/User');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const checkVerificationStatus = async () => {
  try {
    console.log('🔍 Checking current verification status...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all students with populated user data
    const students = await Student.find().populate('userId', 'email isEmailVerified');
    
    console.log('\n📊 Current Verification Status Report:');
    console.log('=====================================');
    
    students.forEach((student, index) => {
      const userVerified = student.userId?.isEmailVerified || false;
      const studentVerified = student.isVerified || false;
      const combinedStatus = userVerified || studentVerified;
      
      console.log(`\n${index + 1}. ${student.name} (${student.email})`);
      console.log(`   User ID: ${student.userId?._id}`);
      console.log(`   Student.isVerified: ${studentVerified}`);
      console.log(`   User.isEmailVerified: ${userVerified}`);
      console.log(`   Combined Status: ${combinedStatus ? '✅ VERIFIED' : '⏳ PENDING'}`);
      
      if (studentVerified !== userVerified) {
        console.log(`   ⚠️  MISMATCH DETECTED! Student=${studentVerified}, User=${userVerified}`);
      }
    });
    
    console.log('\n📈 Summary:');
    const totalStudents = students.length;
    const verifiedStudents = students.filter(s => s.isVerified || s.userId?.isEmailVerified).length;
    const mismatched = students.filter(s => s.isVerified !== s.userId?.isEmailVerified).length;
    
    console.log(`   Total Students: ${totalStudents}`);
    console.log(`   Verified Students: ${verifiedStudents}`);
    console.log(`   Pending Students: ${totalStudents - verifiedStudents}`);
    console.log(`   Mismatched Records: ${mismatched}`);
    
    if (mismatched > 0) {
      console.log('\n🚨 Action Required: Run sync script to fix mismatched records');
    } else {
      console.log('\n🎉 All verification records are in sync!');
    }
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during status check:', error);
    process.exit(1);
  }
};

// Run the check if this file is executed directly
if (require.main === module) {
  checkVerificationStatus();
}

module.exports = checkVerificationStatus;
