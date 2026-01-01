import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { UserRepository } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Please confirm your password')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    body('userType')
      .notEmpty()
      .withMessage('User type is required')
      .isIn(['creator', 'viewer'])
      .withMessage('User type must be either "creator" or "viewer"')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password, userType, profilePicture } = req.body;

      // Check if user already exists
      const existingUser = UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = UserRepository.create({
        name,
        email,
        password: hashedPassword,
        userType,
        profilePicture: profilePicture || null
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return success response without password
      const safeUser = UserRepository.getSafeUser(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return success response without password
      const safeUser = UserRepository.getSafeUser(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal, server logs action)
 * @access  Private
 */
router.post('/logout', authenticate, (req, res) => {
  try {
    // In a JWT-based system, logout is primarily handled client-side
    // by removing the token. However, we can log the action here.
    
    // For more secure systems, you might:
    // 1. Add token to a blacklist (requires database)
    // 2. Use refresh tokens with short-lived access tokens
    // 3. Store tokens in database and mark as invalid

    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/current-user
 * @desc    Get current logged-in user info
 * @access  Private
 */
router.get('/current-user', authenticate, (req, res) => {
  try {
    // User is attached to request by authenticate middleware
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

export default router;
