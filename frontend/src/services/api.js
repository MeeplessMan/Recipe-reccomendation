/**
 * API Service
 * Handles all HTTP requests to the backend API
 */
import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      }
      
      // Handle other HTTP errors
      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 413) {
        toast.error('File too large. Please choose a smaller image.');
      }
      
      return Promise.reject(data || error);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    } else {
      toast.error('An unexpected error occurred.');
      return Promise.reject(error);
    }
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response.data.access_token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  updateProfile: async (updateData) => {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, updateData);
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    return response.data;
  },

  confirmPasswordReset: async (accessToken, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET, { 
      access_token: accessToken, 
      password 
    });
    return response.data;
  },

  // User allergies management
  getAllergies: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ALLERGIES);
    return response.data;
  },

  addAllergy: async (allergyData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.ALLERGIES, allergyData);
    return response.data;
  },

  removeAllergy: async (allergyId) => {
    const response = await api.delete(`${API_ENDPOINTS.AUTH.ALLERGIES}/${allergyId}`);
    return response.data;
  },

  // Account management
  deleteAccount: async (password) => {
    const response = await api.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      data: { password }
    });
    // Clear token after successful account deletion
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    return response.data;
  }
};

// Scan API
export const scanAPI = {
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(API_ENDPOINTS.SCAN.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(API_ENDPOINTS.SCAN.HISTORY, {
      params: { page, limit }
    });
    return response.data;
  },

  getFridgeContents: async () => {
    const response = await api.get(API_ENDPOINTS.SCAN.FRIDGE_CONTENTS);
    return response.data;
  },

  getModelInfo: async () => {
    const response = await api.get(API_ENDPOINTS.SCAN.MODEL_INFO);
    return response.data;
  },

  // Live camera scanning
  liveScan: async (formData, options = {}) => {
    const response = await api.post(API_ENDPOINTS.SCAN.LIVE_SCAN, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
      ...options // Allow passing additional options like signal for abort
    });
    return response.data;
  },

  // Save live scan results
  saveLiveScan: async (data) => {
    const response = await api.post(API_ENDPOINTS.SCAN.SAVE_LIVE_SCAN, data);
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.post(API_ENDPOINTS.SCAN.UPDATE_SETTINGS, settings);
    return response.data;
  }
};

// Recipe API
export const recipeAPI = {
  getRecipes: async (page = 1, perPage = 12) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.LIST, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  getRecipeById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.RECIPES.LIST}/${id}`);
    return response.data;
  },

  createRecipe: async (recipeData) => {
    const response = await api.post(API_ENDPOINTS.RECIPES.CREATE, recipeData);
    return response.data;
  },

  // Search recipes using ingredient matching (POST request)
  searchRecipesByIngredients: async (searchParams) => {
    const response = await api.post(API_ENDPOINTS.RECIPES.SEARCH, searchParams);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get(API_ENDPOINTS.RECIPES.FAVORITES);
    return response.data;
  },

  addToFavorites: async (recipeId) => {
    const response = await api.post(`${API_ENDPOINTS.RECIPES.FAVORITES}/${recipeId}`);
    return response.data;
  },

  removeFromFavorites: async (recipeId) => {
    const response = await api.delete(`${API_ENDPOINTS.RECIPES.FAVORITES}/${recipeId}`);
    return response.data;
  },

  checkFavoriteStatus: async (recipeId) => {
    const response = await api.get(`${API_ENDPOINTS.RECIPES.FAVORITES}/check/${recipeId}`);
    return response.data;
  },

  getAllIngredients: async () => {
    const response = await api.get(API_ENDPOINTS.RECIPES.INGREDIENTS);
    return response.data;
  },

  getRecommendations: async (detectedIngredients, confidenceThreshold = 0.5) => {
    const response = await api.post(API_ENDPOINTS.RECIPES.RECOMMEND, {
      detected_ingredients: detectedIngredients,
      confidence_threshold: confidenceThreshold
    });
    return response.data;
  },

  // Advanced recipe search with filters and sorting (GET request)
  searchRecipes: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.SEARCH, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        category: params.category || '',
        difficulty: params.difficulty || '',
        max_time: params.max_time || null,
        dietary_restriction: params.dietary_restriction || '',
        sort_by: params.sort_by || 'title',
        sort_order: params.sort_order || 'asc'
      }
    });
    return response.data;
  }
};

// Health check API
export const healthAPI = {
  checkHealth: async () => {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  }
};

// Helper functions
export const isAuthenticated = () => {
  return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const clearAuthToken = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// File validation helpers
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please select a JPEG, PNG, or WebP image.');
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File too large. Please select an image smaller than 10MB.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default api;