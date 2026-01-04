import mongoose from 'mongoose';

const savedMovieSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: String,
  overview: String,
  releaseDate: String,
  voteAverage: Number,
  savedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index to ensure a user can't save the same movie multiple times
savedMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const SavedMovie = mongoose.model('SavedMovie', savedMovieSchema);

export default SavedMovie;
