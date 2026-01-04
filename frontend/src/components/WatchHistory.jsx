import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';
import { getWatchHistory, removeFromWatchHistory } from '../services/watchHistory.service';

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const data = await getWatchHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load watch history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this from your watch history?')) {
      return;
    }
    
    try {
      await removeFromWatchHistory(id);
      // Update the local state to remove the deleted item
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error removing from watch history:', error);
      alert('Failed to remove from watch history. Please try again.');
    }
  };

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  if (loading) return <div className="text-center py-4">Loading watch history...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (history.length === 0) return null;

  return (
    <div className="px-4 md:px-8 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Your Watch History</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {history.map((item) => (
          <motion.div 
            key={item._id} 
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* Delete button */}
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-2 right-2 z-10 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                title="Remove from history"
              >
                <FaTrash className="text-white text-sm" />
              </button>
              
              <Link to={`/movie/${item.movieId}`} className="block">
                {item.posterPath ? (
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="overflow-hidden rounded-lg"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.title}
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
                  {item.title}
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory;
