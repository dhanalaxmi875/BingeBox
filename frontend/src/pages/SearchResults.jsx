import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tmdb from '../services/tmdb';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching results for query:', query);
        const data = await tmdb.searchMovies(query);
        console.log('Search results:', data);
        
        if (data && Array.isArray(data.results)) {
          setResults(data.results);
        } else {
          console.error('Unexpected API response format:', data);
          setResults([]);
        }
      } catch (err) {
        console.error('Error in fetchSearchResults:', err);
        setError(err.message || 'Failed to fetch search results');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8 text-center">
        <div className="bg-purple-900/30 border border-purple-500 text-purple-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Search Results for: <span className="text-purple-400">{query}</span>
        </h1>
        
        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">No results found for "{query}"</h2>
            <p className="text-gray-400">Try different keywords or check your spelling.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((movie) => (
              <div 
                key={movie.id} 
                className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-64 md:h-72 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 md:h-72 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image available</span>
                  </div>
                )}
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="flex justify-between items-center text-xs md:text-sm text-gray-400">
                    <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    {movie.vote_average > 0 && (
                      <span className="flex items-center">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
