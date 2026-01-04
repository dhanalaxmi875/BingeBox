import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookmark, FaTrash } from 'react-icons/fa';
import { savedMoviesService } from '../services/savedMovies.service';

const SavedMovies = () => {
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedMovies = async () => {
    try {
      setLoading(true);
      const data = await savedMoviesService.getSavedMovies();
      setSavedMovies(data);
    } catch (err) {
      setError('Failed to load saved movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    if (!window.confirm('Are you sure you want to remove this from your saved movies?')) {
      return;
    }
    
    try {
      await savedMoviesService.removeSavedMovie(movieId);
      // Update the local state to remove the deleted item
      setSavedMovies(prev => prev.filter(movie => movie.movieId !== movieId));
    } catch (error) {
      console.error('Error removing from saved movies:', error);
      alert('Failed to remove from saved movies. Please try again.');
    }
  };

  useEffect(() => {
    fetchSavedMovies();
  }, []);

  if (loading) return <div className="text-center py-4">Loading saved movies...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (savedMovies.length === 0) return null;

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="flex items-center mb-4">
        <FaBookmark className="text-yellow-400 mr-2" />
        <h2 className="text-2xl font-bold text-white">Your Saved Movies</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {savedMovies.map((movie) => (
          <motion.div 
            key={movie._id} 
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* Remove button */}
              <button
                onClick={() => handleRemove(movie.movieId)}
                className="absolute top-2 right-2 z-10 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                title="Remove from saved"
              >
                <FaTrash className="text-white text-sm" />
              </button>
              
              <Link to={`/movie/${movie.movieId}`} className="block">
                {movie.posterPath ? (
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="overflow-hidden rounded-lg"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:opacity-80"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                      }}
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-300">
                    <span className="text-gray-400 group-hover:text-gray-300">No image</span>
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-300 line-clamp-2 group-hover:text-white transition-colors">
                  {movie.title}
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedMovies;
