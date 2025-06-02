const express = require('express');
const router = express.Router();
const Film = require('../models/Film');

// Upload a new film
router.post('/upload', async (req, res) => {
  try {
    const { title, description, url } = req.body;

    const newFilm = new Film({ title, description, url });
    await newFilm.save();

    res.status(201).json({ message: 'Film uploaded successfully', film: newFilm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading film', error: err.message });
  }
});

// Optional: Get all films
router.get('/', async (req, res) => {
  try {
    const films = await Film.find();
    res.status(200).json(films);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching films', error: err.message });
  }
});

module.exports = router;




