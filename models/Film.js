const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: true, // Make sure the videoUrl field is required
  },
  thumbnail: {
    type: String, // You can store the thumbnail URL here if you want to handle thumbnails
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref:'User'// This could store the name of the user who uploaded the film
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the created date to the current date/time
  },
});

module.exports = mongoose.model('Film', filmSchema);
