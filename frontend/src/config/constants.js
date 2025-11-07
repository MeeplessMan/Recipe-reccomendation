// API Configuration and Base URL
const API_BASE_URL = '/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    CONFIRM_PASSWORD_RESET: `${API_BASE_URL}/auth/confirm-password-reset`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
    ALLERGIES: `${API_BASE_URL}/auth/allergies`,
    DELETE_ACCOUNT: `${API_BASE_URL}/auth/delete-account`
  },
  
  // Scanning
  SCAN: {
    UPLOAD: `${API_BASE_URL}/scan/upload`,
    LIVE_SCAN: `${API_BASE_URL}/scan/live-scan`,
    SAVE_LIVE_SCAN: `${API_BASE_URL}/scan/save-live-scan`,
    HISTORY: `${API_BASE_URL}/scan/history`,
    FRIDGE_CONTENTS: `${API_BASE_URL}/scan/fridge-contents`,
    MODEL_INFO: `${API_BASE_URL}/scan/model-info`,
    UPDATE_SETTINGS: `${API_BASE_URL}/scan/update-settings`
  },
  
  // Recipes
  RECIPES: {
    LIST: `${API_BASE_URL}/recipes`,
    CREATE: `${API_BASE_URL}/recipes/create`,
    SEARCH: `${API_BASE_URL}/recipes/search`,
    RECOMMEND: `${API_BASE_URL}/recipes/recommend`,
    FAVORITES: `${API_BASE_URL}/recipes/favorites`,
    INGREDIENTS: `${API_BASE_URL}/recipes/ingredients`
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Recipe Recommenda',
  APP_VERSION: '1.0.0',
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Pagination
  RECIPES_PER_PAGE: 12,
  HISTORY_PER_PAGE: 10,
  
  // Scanner settings
  DEFAULT_CONFIDENCE_THRESHOLD: 0.3,
  MIN_CONFIDENCE_THRESHOLD: 0.1,
  MAX_CONFIDENCE_THRESHOLD: 0.9,
  
  // UI settings
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 300,
  
  // Colors (CSS custom properties will be defined in global styles)
  COLORS: {
    PRIMARY: '#667eea',
    PRIMARY_DARK: '#5a67d8',
    SECONDARY: '#ed8936',
    SUCCESS: '#38a169',
    ERROR: '#e53e3e',
    WARNING: '#d69e2e',
    INFO: '#3182ce',
    GRAY_50: '#f7fafc',
    GRAY_100: '#edf2f7',
    GRAY_200: '#e2e8f0',
    GRAY_300: '#cbd5e0',
    GRAY_400: '#a0aec0',
    GRAY_500: '#718096',
    GRAY_600: '#4a5568',
    GRAY_700: '#2d3748',
    GRAY_800: '#1a202c',
    GRAY_900: '#171923',
  },
  
  // Breakpoints for responsive design
  BREAKPOINTS: {
    XS: '320px',
    SM: '480px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    XXL: '1440px'
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
  }
};

// Development vs Production settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Feature flags (can be controlled via environment variables)
export const FEATURES = {
  CAMERA_SCAN: process.env.REACT_APP_ENABLE_CAMERA !== 'false',
  FILE_UPLOAD: true,
  RECIPE_CREATION: true,
  USER_PROFILES: true,
  RECIPE_SEARCH: true,
  FAVORITES: true,
  SCAN_HISTORY: true,
  OFFLINE_MODE: false // Future feature
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ingredient_scanner_token',
  USER_PREFERENCES: 'ingredient_scanner_preferences',
  SCAN_SETTINGS: 'ingredient_scanner_scan_settings',
  THEME: 'ingredient_scanner_theme'
};