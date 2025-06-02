const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Video = require('../models/Video');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// 1️⃣ Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 2️⃣ Upload video file only (Requires auth)
router.post('/upload-file', auth, upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const videoUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: videoUrl });
});

// 3️⃣ Upload video metadata (Requires auth)
router.post('/upload', auth, async (req, res) => {
  const { title, description, videoUrl } = req.body;

  if (!title || !videoUrl) {
    return res.status(400).json({ error: 'Title and videoUrl are required' });
  }

  try {
    const newVideo = new Video({
      title,
      description,
      videoUrl,
      uploadedBy: req.user.id,
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video metadata saved', video: newVideo });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4️⃣ Get all videos (Public)
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).populate('uploadedBy', 'username');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 5️⃣ Stream video file (Public)
router.get('/stream/:filename', (req, res) => {
  const { filename } = req.params;
  const videoPath = path.join(__dirname, '..', 'uploads', filename);

  fs.stat(videoPath, (err, stats) => {
    if (err) return res.status(404).send('Video not found');

    const range = req.headers.range;
    if (!range) return res.status(416).send('Requires Range header');

    const CHUNK_SIZE = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, stats.size - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  });
});

// 6️⃣ Delete a video by ID (Requires auth & ownership)
router.delete('/videos/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this video' });
    }

    const videoPath = path.join(__dirname, '..', video.videoUrl);
    fs.unlink(videoPath, (err) => {
      if (err) console.warn('File not found or already deleted:', err.message);
    });

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during delete' });
  }
});

// 7️⃣ Update video title and description (Requires auth & ownership)
router.put('/videos/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this video' });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    await video.save();

    res.json({ message: 'Video updated successfully', video });
  } catch (err) {
    res.status(500).json({ error: 'Server error during update' });
  }
});

module.exports = router;
