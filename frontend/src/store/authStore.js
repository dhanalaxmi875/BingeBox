import { create } from "zustand";
import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`[${config.method?.toUpperCase()}] ${config.url}`, config.data ? { data: config.data } : '');
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[${response.status}] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config.url,
        method: error.config.method,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', {
        url: error.config.url,
        method: error.config.method,
        message: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create((set) => ({
  // initial states
  user: null,
  isLoading: false,
  error: null,
  message: null,
  fetchingUser: true,

  // functions

  signup: async (username, email, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await api.post('/api/signup', {
        username,
        email,
        password,
      });

      set({ user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error signing up";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await api.post('/api/login', {
        username,
        password,
      });

      const { user, message } = response.data;

      set({
        user,
        message,
        isLoading: false,
        error: null
      });

      return { user, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error logging in";
      set({
        isLoading: false,
        error: errorMessage,
        user: null
      });
      throw new Error(errorMessage);
    }
  },

  fetchUser: async () => {
    set({ fetchingUser: true, error: null });

    try {
      console.log('Fetching user data...');
      const response = await api.get('/api/fetch-user');
      
      console.log('User data fetched successfully:', response.data);
      set({ 
        user: response.data.user,
        fetchingUser: false 
      });
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Clear user data on 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('User not authenticated, clearing user data');
        set({ 
          user: null,
          fetchingUser: false 
        });
      } else {
        set({ 
          error: error.response?.data?.message || 'Failed to fetch user data',
          fetchingUser: false 
        });
      }
      
      return null;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await api.post('/api/logout');
      set({ user: null, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        isLoading: false,
        error: error.response?.data?.message || 'Error logging out' 
      });
      return { success: false, error: error.message };
    }
  },
}));
