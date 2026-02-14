import { verifyToken } from '../config/auth.js';

/**
 * Middleware to verify JWT token in Authorization header
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    req.userId = decoded.sub; // Attach user ID to request
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
};

/**
 * Middleware to handle async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
