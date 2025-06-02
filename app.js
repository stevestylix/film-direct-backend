const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const dashboardRoutes = require('./routes/dashboard'); // added

const app = express();

// 1. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/film-direct-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// 2. Middleware
app.use(cors({
  origin: 'http://localhost:3000', // adjust if needed
  credentials: true
}));
app.use(express.json());

// 3. Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Routes
app.use('/api/users', authRoutes);     // /api/users/login, /api/users/register
app.use('/api', videoRoutes);          // /api/upload, etc.
app.use('/api', dashboardRoutes);      // /api/dashboard

// 5. Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 6. 404 fallback
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
