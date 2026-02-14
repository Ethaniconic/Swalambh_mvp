import express from 'express';
import { createAccessToken, hashPassword, verifyPassword } from '../config/auth.js';
import { User } from '../models/User.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { asyncHandler } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper to convert MongoDB user document to public format
 */
const userPublic = (doc) => ({
  id: doc._id.toString(),
  email: doc.email,
  full_name: doc.full_name,
  role: doc.role,
  created_at: doc.createdAt,
});

/**
 * POST /auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { email, password, full_name, role } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(422).json({ detail: 'Invalid email format' });
    }

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(422).json({ detail: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ detail: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      full_name: full_name || null,
      role: role || null,
      hashed_password: hashedPassword,
    });

    await user.save();
    return res.status(201).json(userPublic(user));
  })
);

/**
 * POST /auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(422).json({ detail: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    // Create token
    const accessToken = createAccessToken(user._id.toString());

    return res.status(200).json({
      access_token: accessToken,
      token_type: 'bearer',
      user: userPublic(user),
    });
  })
);

/**
 * POST /auth/forgot
 * Request password reset
 */
router.post(
  '/forgot',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({ detail: 'Email is required' });
    }

    // Find user (silently fail for security)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      await PasswordReset.create({
        user_id: user._id,
        used: false,
      });
    }

    // Always return same response for security
    return res.status(202).json({
      message: 'If the account exists, a reset link will be sent.',
    });
  })
);

export default router;
