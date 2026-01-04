import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const savedMoviesService = {
  // Save a movie
  saveMovie: async (movieData) => {
    try {
      console.log('Saving movie:', movieData);
      const response = await api.post('/api/saved-movies', movieData);
      console.log('Save movie response:', response.data);
      // Return the saved movie data directly
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error in saveMovie:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      const errorMessage = error.response?.data?.message || 'Failed to save movie';
      const errorToThrow = new Error(errorMessage);
      errorToThrow.response = error.response;
      throw errorToThrow;
    }
  },

  // Get all saved movies
  getSavedMovies: async () => {
    try {
      const response = await api.get('/api/saved-movies');
      console.log('API Response:', response); // Debug log
      // Return response.data.data if it exists, otherwise return response.data
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching saved movies:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data?.message || 'Failed to fetch saved movies';
    }
  },

  // Remove a saved movie
  removeSavedMovie: async (movieId) => {
    try {
      const response = await api.delete(`/api/saved-movies/${movieId}`);
      console.log('Removed saved movie:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing saved movie:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data?.message || 'Failed to remove saved movie';
    }
  },

  // Test endpoint
  test: async () => {
    try {
      console.log('Testing saved movies API...');
      const response = await api.get('/api/saved-movies/test');
      console.log('Test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing saved movies API:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      throw error;
    }
  }
};
