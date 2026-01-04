import mongoose from 'mongoose';

console.log('Loading Review model...');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure a user can only leave one review per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Static method to get average rating for a movie
reviewSchema.statics.getAverageRating = async function(movieId) {
  const result = await this.aggregate([
    {
      $match: { movieId }
    },
    {
      $group: {
        _id: '$movieId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    // You can update a movie's average rating here if you have a Movie model
    // For now, we'll just return the result
    return result[0] || { averageRating: 0, reviewCount: 0 };
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.movieId);
});

// Call getAverageRating after remove
reviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.movieId);
});

// Check if model is already compiled
let Review;
try {
  // Try to get the model if it's already been registered
  Review = mongoose.model('Review');
  console.log('Review model already registered');
} catch (e) {
  // If not, register the model
  console.log('Registering Review model...');
  Review = mongoose.model('Review', reviewSchema);
}

console.log('Review model loaded successfully');

export default Review;
