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
});

export const reviewService = {
  // Get reviews for a movie
  getReviews: async (movieId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/api/reviews/movie/${movieId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error.response?.data?.message || 'Failed to fetch reviews';
    }
  },

  // Get a single review
  getReview: async (id) => {
    try {
      const response = await api.get(`/api/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error.response?.data?.message || 'Failed to fetch review';
    }
  },

  // Create or update a review
  saveReview: async (reviewData) => {
    try {
      const response = await api.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error saving review:', error);
      throw error.response?.data?.message || 'Failed to save review';
    }
  },

  // Delete a review
  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/api/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error.response?.data?.message || 'Failed to delete review';
    }
  },

  // Get user's review for a movie
  getUserReview: async (movieId) => {
    try {
      const response = await api.get(`/api/reviews/user/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user review:', error);
      throw error.response?.data?.message || 'Failed to fetch user review';
    }
  }
};
