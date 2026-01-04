import axios from 'axios';
import { API_URL } from './api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to log requests
api.interceptors.request.use(config => {
  console.log(`[${config.method?.toUpperCase()}] ${config.url}`, config.data || '');
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use(
  response => {
    console.log(`[${response.status}] ${response.config.url}`, response.data);
    return response;
  },
  error => {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    };
    
    console.error('Response error:', errorInfo);
    return Promise.reject(error);
  }
);

const addToWatchHistory = async (movieData) => {
  try {
    console.log('Adding to watch history:', movieData);
    const response = await api.post('/api/watch-history', movieData);
    return response.data;
  } catch (error) {
    console.error('Error in addToWatchHistory:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};

const getWatchHistory = async () => {
  try {
    console.log('Fetching watch history...');
    const response = await api.get('/api/watch-history');
    return response.data;
  } catch (error) {
    console.error('Error in getWatchHistory:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      response: error.response?.data
    });
    throw error;
  }
};

const removeFromWatchHistory = async (id) => {
  try {
    console.log('Removing from watch history:', id);
    const response = await api.delete(`/api/watch-history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in removeFromWatchHistory:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      response: error.response?.data
    });
    throw error;
  }
};

export { addToWatchHistory, getWatchHistory, removeFromWatchHistory };
