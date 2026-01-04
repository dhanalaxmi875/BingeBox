import { Play, Loader2, Bookmark, BookmarkCheck, Star, StarHalf } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { addToWatchHistory } from "../services/watchHistory.service";
import { savedMoviesService } from "../services/savedMovies.service";
import { useAuthStore } from "../store/authStore";
import { toast } from 'react-toastify';
import MovieReviews from "../components/MovieReviews";

const Moviepage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  const handleWatchTrailer = async () => {
    console.log('Watch Now button clicked');
    if (!trailerKey) {
      console.error('No trailer key available');
      return;
    }
    
    try {
      // Only track watch history for authenticated users
      if (user) {
        console.log('User is authenticated, adding to watch history...');
        const watchData = {
          movieId: String(movie.id), // Ensure movieId is a string
          title: movie.title,
          posterPath: movie.poster_path || ''
        };
        console.log('Sending watch data:', watchData);
        
        const result = await addToWatchHistory(watchData);
        console.log('Watch history response:', result);
      } else {
        console.log('User not authenticated, skipping watch history');
      }
      
      // Open the trailer in a new tab
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
    } catch (error) {
      console.error('Error in handleWatchTrailer:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      // Still open the trailer even if tracking fails
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
    }
  };

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NTgzMDFlZGQ2MGEzN2Y3NDlmMzhlNGFmMTJjZDE3YSIsIm5iZiI6MTc0NTQxNjIyNS44NzY5OTk5LCJzdWIiOiI2ODA4ZjAyMTI3NmJmNjRlNDFhYjY0ZWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.NA_LMt6-MUBLAvxMRkZtBoUif4p9YQ6aYZo-lv4-PUE",
    },
  };

  const checkIfSaved = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      const savedMovies = await savedMoviesService.getSavedMovies();
      const isMovieSaved = savedMovies.some(movie => movie.movieId === id);
      setIsSaved(isMovieSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }, [id, user]);

  const handleSaveForLater = async () => {
    if (!user) {
      toast.error('Please sign in to save movies');
      navigate('/signin');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        // Remove from saved
        await savedMoviesService.removeSavedMovie(id);
        setIsSaved(false);
        toast.success('Removed from saved list');
      } else {
        // Save movie
        const movieData = {
          movieId: id,
          title: movie.title,
          posterPath: movie.poster_path,
          overview: movie.overview,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average
        };
        
        console.log('Saving movie data:', movieData);
        const response = await savedMoviesService.saveMovie(movieData);
        console.log('Save movie response:', response);
        
        // Update the saved status based on the response
        setIsSaved(true);
        toast.success('Saved for later');
      }
    } catch (error) {
      console.error('Error updating saved status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/signin');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Movie already saved');
      } else {
        toast.error(error.message || 'Failed to update saved status');
      }
    } finally {
      setSaving(false);
    }
  };

  const fetchMovieData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Reset states
      setMovie(null);
      setRecommendations([]);
      setTrailerKey(null);
      setIsSaved(false);
      
      // Fetch movie details, recommendations, and videos in parallel
      const [movieResponse, recResponse, videosResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options),
        fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`, options),
        fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
      ]);
      
      if (!movieResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }
      
      const [movieData, recData, videosData] = await Promise.all([
        movieResponse.json(),
        recResponse.json(),
        videosResponse.json()
      ]);
      
      // Find trailer
      const trailer = videosData.results?.find(
        (vid) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      
      // Update states
      setMovie(movieData);
      setRecommendations(recData.results || []);
      setTrailerKey(trailer?.key || null);
      
      // Check if movie is saved
      if (user) {
        const savedMovies = await savedMoviesService.getSavedMovies();
        const isMovieSaved = savedMovies.some(movie => movie.movieId === id);
        setIsSaved(isMovieSaved);
      }
      
    } catch (err) {
      console.error('Error fetching movie data:', err);
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Reset states when id changes
  useEffect(() => {
    // Reset all states when the id changes
    setMovie(null);
    setRecommendations([]);
    setTrailerKey(null);
    setLoading(true);
    setError(null);
  }, [id]);

  // Fetch data when component mounts or id changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [movieResponse, recResponse, videosResponse] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options),
          fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US&page=1`, options),
          fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
        ]);
        
        if (!movieResponse.ok) throw new Error('Failed to fetch movie details');
        
        const [movieData, recData, videosData] = await Promise.all([
          movieResponse.json(),
          recResponse.json(),
          videosResponse.json()
        ]);
        
        if (isMounted) {
          setMovie(movieData);
          setRecommendations(recData.results || []);
          
          const trailer = videosData.results?.find(
            (vid) => vid.site === "YouTube" && vid.type === "Trailer"
          );
          setTrailerKey(trailer?.key || null);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching movie data:', error);
          setError('Failed to load movie details. Please try again.');
          setLoading(false);
        }
      }
    };
    
    // Only fetch if we don't have the movie data yet
    if (!movie && id) {
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, movie]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button
          onClick={() => fetchMovieData()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-white mb-4">Movie Not Found</h2>
        <p className="text-gray-300 mb-6">The movie you're looking for doesn't exist or was removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div
        className="relative h-[60vh] flex item-end"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

        <div className="relative z-10 flex items-end p-8 gap-8">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
            className="rounded-lg shadow-lg w-48 hidden md:block"
          />

          <div>
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-2">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date}</span>
              <span>{movie.runtime} min</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((genre) => (
                <span 
                  key={`genre-${genre.id}`}
                  className="bg-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="max-w-2xl text-gray-200">{movie.overview}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleWatchTrailer}
                className="flex-1 md:flex-none justify-center items-center bg-[#641374] text-white py-3 px-6 rounded-full cursor-pointer text-sm md:text-base flex gap-2"
                disabled={!trailerKey}
              >
                <Play className="w-4 h-5 md:w-5 md:h-5" /> Watch Now
              </button>
              <button
                onClick={handleSaveForLater}
                disabled={saving}
                className={`flex-1 md:flex-none justify-center items-center ${
                  isSaved ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                } text-white py-3 px-6 rounded-full cursor-pointer text-sm md:text-base flex gap-2 transition-colors`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-5 md:w-5 md:h-5 animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="w-4 h-5 md:w-5 md:h-5" />
                ) : (
                  <Bookmark className="w-4 h-5 md:w-5 md:h-5" />
                )}
                {isSaved ? 'Saved' : 'Save for Later'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="bg-[#232323] rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ul className="space-y-4">
              <li key="status">
                <span className="font-semibold text-white">Status:</span>{" "}
                <span className="ml-2">{movie.status}</span>
              </li>

              <li key="release-date">
                <span className="font-semibold text-white">Release Date:</span>{" "}
                <span className="ml-2">{movie.release_date}</span>
              </li>

              <li key="original-language">
                <span className="font-semibold text-white">
                  Original Language:
                </span>
                <span className="ml-2">
                  {movie.original_language?.toUpperCase()}
                </span>
              </li>

              <li key="budget">
                <span className="font-semibold text-white">Budget: </span>
                <span className="ml-2">
                  {movie.budget ? `$${movie.budget.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li key="revenue">
                <span className="font-semibold text-white">Revenue:</span>{" "}
                <span className="ml-2">
                  {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "N/A"}
                </span>
              </li>

              <li key="production-companies">
                <span className="font-semibold text-white">
                  Production Companies:
                </span>
                <span className="ml-2">
                  {movie.production_companies &&
                  movie.production_companies.length > 0
                    ? movie.production_companies.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">Countries:</span>
                <span className="ml-2">
                  {movie.production_countries &&
                  movie.production_countries.length > 0
                    ? movie.production_countries.map((c) => c.name).join(", ")
                    : "N/A"}
                </span>
              </li>

              <li>
                <span className="font-semibold text-white">
                  Spoken Languages:
                </span>
                <span className="ml-2">
                  {movie.spoken_languages && movie.spoken_languages.length > 0
                    ? movie.spoken_languages
                        .map((l) => l.english_name)
                        .join(", ")
                    : "N/A"}
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Tagline</h3>
            <p className="italic text-gray-400 mb-6">
              {movie.tagline || "No tagline available."}
            </p>

            <h3 className="font-semibold text-white mb-2">Overview</h3>
            <p className="text-gray-200">{movie.overview}</p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">
            You might also like...
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.slice(0, 5).map((rec) => (
              rec.poster_path && (
                <div
                  key={rec.id}
                  className="bg-[#232323] rounded-lg overflow-hidden hover:scale-105 transition"
                >
                  <Link to={`/movie/${rec.id}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                      alt={rec.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                      }}
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold line-clamp-1">{rec.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">
                          {rec.release_date?.slice(0, 4) || 'N/A'}
                        </span>
                        <div className="flex items-center text-yellow-400 text-xs">
                          <span>⭐</span>
                          <span className="ml-1">{rec.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Movie Reviews Section */}
      <div className="px-8 pb-8">
        <MovieReviews movieId={id} movieTitle={movie?.title} />
      </div>
    </div>
  );
};

export default Moviepage;
