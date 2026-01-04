import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import Review from '../models/review.model.js';
import mongoose from 'mongoose';

// Debug: Log model connection status
console.log('Review model registered:', mongoose.modelNames().includes('Review') ? 'Yes' : 'No');
console.log('Mongoose models:', mongoose.modelNames());

const router = express.Router();

// Get all reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movieId })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ movieId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Get a single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username profilePicture');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
});

// Create or update a review
router.post('/', verifyToken, async (req, res) => {
  console.log('POST /api/reviews - Request body:', req.body);
  try {
    const { movieId, rating, content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!movieId || !rating || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, rating, and content'
      });
    }

    // Check if review already exists
    console.log('Checking for existing review for user:', userId, 'movie:', movieId);
    let review = await Review.findOne({ userId, movieId });
    console.log('Existing review found:', review ? 'Yes' : 'No');

    if (review) {
      // Update existing review
      review.rating = rating;
      review.content = content;
      review.updatedAt = new Date();
    } else {
      // Create new review
      review = new Review({
        userId,
        movieId,
        rating,
        content
      });
    }

    await review.save();

    // Populate user data for response
    await review.populate('userId', 'username profilePicture');

    res.status(201).json({
      success: true,
      message: review.isNew ? 'Review added successfully' : 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save review',
      error: error.message
    });
  }
});

// Delete a review
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// Get user's review for a movie
router.get('/user/:movieId', verifyToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ userId, movieId })
      .populate('userId', 'username profilePicture');

    if (!review) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user review',
      error: error.message
    });
  }
});

export default router;
