const express = require('express');
const { body } = require('express-validator');
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');

const router = express.Router();

// Validation rules
const studentValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('course').trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters long'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const studentUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('course').optional().trim().isLength({ min: 2 }).withMessage('Course must be at least 2 characters long')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', adminOnly, getAllStudents);
router.get('/:id', adminOnly, getStudent);
router.post('/', adminOnly, studentValidation, createStudent);
router.put('/:id', adminOnly, studentUpdateValidation, updateStudent);
router.delete('/:id', adminOnly, deleteStudent);

module.exports = router;
