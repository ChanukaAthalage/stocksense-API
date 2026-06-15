import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// `protect` middleware verifies the Bearer JWT, loads the current user,
// ensures the account is active, and attaches the user to `req.user`.
// It returns specific 401 messages for the failure modes requested.
export const protect = async (req, res, next) => {
  try {
    // Read the Authorization header (support lowercase or capitalized keys)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // If header missing or doesn't start with "Bearer ", respond with 401
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    // Extract token from header: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token using secret from environment. If invalid/expired,
    // jwt.verify will throw — we catch and return the required 401 message.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }

    // Fetch a fresh copy of the user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      // If the user referenced by the token no longer exists
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // Ensure the user's account is active
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is disabled' });
    }

    // Attach user to request for downstream handlers and continue
    req.user = user;
    return next();
  } catch (error) {
    // Generic fallback for unexpected errors related to auth
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

// Role-based authorization middleware.
// Use like: authorizeRoles('admin', 'warehouse_manager')
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ success: false, message: 'Forbidden, insufficient permissions' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden, insufficient permissions' });
  }

  return next();
};

export default protect;
