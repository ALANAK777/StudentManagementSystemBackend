const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students (Admin only)
// @route   GET /api/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Student.countDocuments();
    const students = await Student.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'email isEmailVerified');

    // Enhance each student object with computed verification status
    const enhancedStudents = students.map(student => {
      const studentObj = student.toObject();
      const isUserVerified = student.userId?.isEmailVerified || false;
      const isStudentVerified = student.isVerified || false;
      const combinedVerificationStatus = isUserVerified || isStudentVerified;
      
      return {
        ...studentObj,
        verificationStatus: {
          userVerified: isUserVerified,
          studentVerified: isStudentVerified,
          isVerified: combinedVerificationStatus
        }
      };
    });

    // Debug: Log verification status for troubleshooting (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Backend - Students verification status:');
      enhancedStudents.forEach(student => {
        console.log(`- ${student.name}:`, {
          'Student.isVerified': student.isVerified,
          'User.isEmailVerified': student.userId?.isEmailVerified,
          'Combined.isVerified': student.verificationStatus.isVerified
        });
      });
    }

    res.json({
      success: true,
      data: {
        students: enhancedStudents,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'email isEmailVerified');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new student (Admin only)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, course, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user account for student
    const user = await User.create({
      email,
      password: password || 'defaultPassword123',
      role: 'student'
    });

    // Create student profile
    const student = await Student.create({
      userId: user._id,
      name,
      email,
      course
    });

    // Populate user data
    await student.populate('userId', 'email isEmailVerified');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update student (Admin only)
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, course } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent && existingStudent._id.toString() !== student._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Update email in User model as well
      await User.findByIdAndUpdate(student.userId, { email });
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course },
      { new: true, runValidators: true }
    ).populate('userId', 'email isEmailVerified');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete student (Admin only)
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user account
    await User.findByIdAndDelete(student.userId);
    
    // Delete student profile
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
};
