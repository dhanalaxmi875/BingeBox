import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import WatchHistory from '../models/watchHistory.model.js';

const router = express.Router();

// Add to watch history
router.post('/', verifyToken, async (req, res) => {
  console.log('=== WATCH HISTORY REQUEST ===');
  console.log('User ID:', req.user?.id);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  try {
    const { movieId, title, posterPath } = req.body;
    
    if (movieId === undefined || movieId === null || title === undefined || title === null) {
      console.error('Missing required fields:', { movieId, title });
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        receivedData: { movieId, title, posterPath }
      });
    }
    
    // Ensure movieId is a valid number
    let movieIdNum;
    try {
      // First try to convert to number
      movieIdNum = Number(movieId);
      
      // If it's not a valid number or is NaN after conversion
      if (isNaN(movieIdNum) || !Number.isFinite(movieIdNum)) {
        throw new Error('Invalid movieId format');
      }
      
      // Ensure it's an integer
      movieIdNum = Math.round(movieIdNum);
      
    } catch (error) {
      console.error('Error processing movieId:', error);
      return res.status(400).json({ 
        success: false,
        message: 'movieId must be a valid number',
        receivedValue: movieId,
        error: error.message
      });
    }

    console.log(`Processing watch history for user ${req.user.id}, movie ${movieIdNum}`);
    
    // Create or update the watch history entry
    const watchHistory = await WatchHistory.findOneAndUpdate(
      { 
        userId: req.user.id, 
        movieId: movieIdNum 
      },
      { 
        $set: { 
          title: String(title),
          posterPath: posterPath ? String(posterPath) : '',
          watchedAt: new Date() 
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Watch history updated:', watchHistory);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Added to watch history',
      data: watchHistory
    });
  } catch (error) {
    // Log detailed error information
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    console.error('Error in watch history route:', errorInfo);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'This movie is already in your watch history',
        error: process.env.NODE_ENV === 'development' ? 'Duplicate key error' : undefined
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: messages,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Handle other types of errors
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while updating watch history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's watch history
router.get('/', verifyToken, async (req, res) => {
  try {
    const history = await WatchHistory.find({ userId: req.user.id })
      .sort({ watchedAt: -1 }) // Most recent first
      .limit(20); // Limit to 20 most recent
    
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete from watch history
router.delete('/:id', verifyToken, async (req, res) => {
  console.log('=== DELETE WATCH HISTORY ITEM ===');
  console.log('User ID:', req.user?.id);
  console.log('Item ID to delete:', req.params.id);

  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find and delete the item, ensuring it belongs to the requesting user
    const deletedItem = await WatchHistory.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedItem) {
      console.error('Watch history item not found or not authorized');
      return res.status(404).json({ 
        success: false,
        message: 'Watch history item not found or you do not have permission to delete it'
      });
    }

    console.log('Successfully deleted watch history item:', deletedItem._id);
    res.status(200).json({ 
      success: true,
      message: 'Removed from watch history',
      deletedItemId: deletedItem._id
    });
  } catch (error) {
    console.error('Error removing from watch history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

export default router;
