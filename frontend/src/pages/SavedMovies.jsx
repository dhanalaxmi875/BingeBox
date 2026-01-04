import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Loader2, Play } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { savedMoviesService } from '../services/savedMovies.service';
import { toast } from 'react-toastify';

const SavedMovies = () => {
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const { user } = useAuthStore();

  const fetchSavedMovies = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const movies = await savedMoviesService.getSavedMovies();
      setSavedMovies(movies);
    } catch (error) {
      console.error('Error fetching saved movies:', error);
      setError('Failed to load saved movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (movieId) => {
    if (!user) return;
    
    try {
      setRemovingId(movieId);
      await savedMoviesService.removeSavedMovie(movieId);
      setSavedMovies(prev => prev.filter(movie => movie.movieId !== movieId));
      toast.success('Removed from saved list');
    } catch (error) {
      console.error('Error removing saved movie:', error);
      toast.error(error.message || 'Failed to remove movie');
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedMovies();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#181818] text-white flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="text-gray-300 mb-6">Please sign in to view your saved movies.</p>
        <Link 
          to="/signin" 
          className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          state={{ from: '/saved' }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button
          onClick={fetchSavedMovies}
          className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Saved Movies</h1>
        
        {savedMovies.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300">No saved movies yet</h3>
            <p className="text-gray-500 mt-2">Save movies to watch later and they'll appear here</p>
            <Link 
              to="/" 
              className="inline-block mt-6 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedMovies.map((movie) => (
              <div 
                key={movie._id} 
                className="bg-[#232323] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <Link to={`/movie/${movie.movieId}`}>
                    <img
                      src={movie.posterPath 
                        ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                        : 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                    <Link 
                      to={`/movie/${movie.movieId}`}
                      className="w-full flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" /> Watch Now
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      <Link to={`/movie/${movie.movieId}`} className="hover:underline">
                        {movie.title}
                      </Link>
                    </h3>
                    <button
                      onClick={() => handleRemoveSaved(movie.movieId)}
                      disabled={removingId === movie.movieId}
                      className="text-gray-400 hover:text-white transition-colors p-1 -mt-1 -mr-1"
                      title="Remove from saved"
                    >
                      {removingId === movie.movieId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <BookmarkCheck className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <span>⭐ {movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                    <span className="mx-2">•</span>
                    <span>{movie.releaseDate?.substring(0, 4) || 'N/A'}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMovies;
