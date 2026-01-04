import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  movieId: {
    type: Number,
    required: [true, 'Movie ID is required'],
    index: true,
    // Add custom getter/setter to ensure consistent type
    get: v => Math.round(v), // Ensure it's an integer
    set: v => Math.round(v)  // Ensure it's an integer
  },
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  posterPath: {
    type: String,
    default: ''
  },
  watchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: true,
  // Explicitly set the collection name
  collection: 'watchhistories'
});

// Create a compound index to prevent duplicate entries for the same user and movie
watchHistorySchema.index(
  { 
    userId: 1, 
    movieId: 1 
  }, 
  { 
    unique: true,
    name: 'user_movie_unique',
    background: true,
    partialFilterExpression: { 
      userId: { $exists: true }, 
      movieId: { $exists: true } 
    }
  }
);

// Add a pre-save hook to ensure consistent data
watchHistorySchema.pre('save', function(next) {
  // Ensure movieId is a number
  if (typeof this.movieId === 'string') {
    this.movieId = parseInt(this.movieId, 10);
  } else if (typeof this.movieId !== 'number') {
    return next(new Error('movieId must be a number'));
  }
  
  // Ensure userId is a valid ObjectId
  if (this.userId && typeof this.userId === 'string') {
    if (!mongoose.Types.ObjectId.isValid(this.userId)) {
      return next(new Error('Invalid userId format'));
    }
  }
  
  // Ensure watchedAt is set to current time if not provided
  if (!this.watchedAt) {
    this.watchedAt = new Date();
  }
  
  next();
});

// Add a pre-save hook to log document before saving
watchHistorySchema.pre('save', function(next) {
  console.log('Saving watch history:', this);
  next();
});

// Add error handling for save operations
watchHistorySchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('This movie is already in your watch history'));
  } else {
    next(error);
  }
});

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

export default WatchHistory;
