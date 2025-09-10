const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  sendStudentVerification,
  verifyStudent,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('course').optional().trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters long'),
  body('role').optional().isIn(['admin', 'student']).withMessage('Role must be either admin or student')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('course').optional().trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters long')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/change-password', auth, changePassword);

// Verification routes
router.post('/send-verification', auth, sendStudentVerification);
router.get('/verify-student/:token', verifyStudent);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
