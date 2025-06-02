const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Video = require('../models/Video');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_default_secret';

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// GET /api/dashboard - Dashboard overview for logged-in creator
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get films with pagination
    const films = await Video.find({ uploader: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFilms = await Video.countDocuments({ uploader: req.user.id });
    const totalSales = films.reduce((sum, film) => sum + (film.sales || 0), 0);

    // Optional: update lastLogin (you can set this during login instead)
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Welcome to your dashboard!',
      user,
      stats: {
        filmsUploaded: totalFilms,
        totalSales,
        lastLogin: user.lastLogin,
        currentPage: page,
        totalPages: Math.ceil(totalFilms / limit)
      },
      films,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
