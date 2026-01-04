import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import SavedMovie from '../models/savedMovie.model.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Saved movies API is working!' });
});

// Save a movie for later
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received save request with data:', req.body);
    
    const { movieId, title, posterPath, overview, releaseDate, voteAverage } = req.body;
    
    // Input validation
    if (!movieId || !title) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: movieId and title are required' 
      });
    }

    // Check if movie is already saved
    const existingMovie = await SavedMovie.findOne({
      userId: req.user.id,
      movieId: movieId.toString()
    });

    if (existingMovie) {
      return res.status(400).json({ 
        success: false,
        message: 'Movie already saved' 
      });
    }

    const savedMovie = new SavedMovie({
      userId: req.user.id,
      movieId: movieId.toString(),
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage
    });

    const result = await savedMovie.save();
    console.log('Movie saved successfully:', result);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error saving movie:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save movie',
      error: error.message 
    });
  }
});

// Get all saved movies for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const savedMovies = await SavedMovie.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: savedMovies
    });
  } catch (error) {
    console.error('Error fetching saved movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved movies',
      error: error.message
    });
  }
});

// Remove a saved movie
router.delete('/:movieId', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await SavedMovie.findOneAndDelete({
      userId: req.user.id,
      movieId: movieId.toString()
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved movie not found'
      });
    }

    res.json({
      success: true,
      message: 'Movie removed from saved list'
    });
  } catch (error) {
    console.error('Error removing saved movie:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved movie',
      error: error.message
    });
  }
});

export default router;
