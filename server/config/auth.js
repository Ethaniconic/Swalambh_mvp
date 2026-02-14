import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY?.trim();
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not set. Add it to .env or the environment.');
}

const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_DAYS = parseInt(process.env.ACCESS_TOKEN_EXPIRE_DAYS || '7', 10);

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verify a password against its hash
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Create JWT access token
 * @param {object} subject - Token subject (usually user ID)
 * @param {number} expiresIn - Expiration time in days (optional)
 * @returns {string} - JWT token
 */
export const createAccessToken = (subject, expiresIn = ACCESS_TOKEN_EXPIRE_DAYS) => {
  const expiresInSeconds = expiresIn * 24 * 60 * 60; // Convert days to seconds
  const payload = {
    sub: subject,
  };
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: ALGORITHM,
    expiresIn: expiresInSeconds,
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
