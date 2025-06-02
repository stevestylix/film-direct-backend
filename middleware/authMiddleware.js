// ======== Middleware: middleware/auth.js ========
const jwt = require('jsonwebtoken');

// Use an environment variable for the secret key (fallback included)
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_default_secret';

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  // No Authorization header present
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Extract token from "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};



