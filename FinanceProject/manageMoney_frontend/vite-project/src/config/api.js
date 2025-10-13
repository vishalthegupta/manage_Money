// API Configuration
const API_CONFIG = {
  // Development environment
  development: {
    baseURL: 'http://localhost:8080',
    timeout: 10000, // 10 seconds
  },
  // Production environment (update this when deploying)
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://managemoney.onrender.com', // Use environment variable or fallback
    timeout: 15000, // 15 seconds
  },
  // Staging environment (optional)
  staging: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-staging-api.com', // Use environment variable or fallback
    timeout: 12000, // 12 seconds
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  // Check if we're in production build
  if (import.meta.env.PROD) {
    return 'production';
  } else if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }
  return 'development';
};

// Get current configuration
const currentConfig = API_CONFIG[getCurrentEnvironment()];

// API Endpoints
export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: currentConfig.baseURL,
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/users/me',
  },
  
  // User endpoints
  USERS: {
    UPDATE_PROFILE: (userId) => `/api/users/update-profile/${userId}`,
  },
  
  // Income endpoints
  INCOME: {
    CREATE: '/api/income',
    GET_ALL: (userId) => `/api/income/user/${userId}/all`,
    UPDATE: (id) => `/api/income/${id}`,
    DELETE: (id) => `/api/income/${id}`,
  },
  
  // Expense endpoints
  EXPENSE: {
    CREATE: '/api/expense',
    GET_ALL: (userId) => `/api/expense/user/${userId}/all`,
    UPDATE: (id) => `/api/expense/${id}`,
    DELETE: (id) => `/api/expense/${id}`,
  },
  
  // Investment endpoints
  INVESTMENT: {
    CREATE: '/api/investment',
    GET_ALL: (userId) => `/api/investment/user/${userId}/all`,
    UPDATE: (id) => `/api/investment/${id}`,
    DELETE: (id) => `/api/investment/${id}`,
  },
  
  // Loan endpoints
  LOAN: {
    CREATE: '/api/loan',
    GET_ALL: (userId) => `/api/loan/user/${userId}/all`,
    UPDATE: (id) => `/api/loan/${id}`,
    DELETE: (id) => `/api/loan/${id}`,
  },
};

// Configuration options
export const API_CONFIG_OPTIONS = {
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_ENDPOINTS.BASE_URL}${endpoint}`;
};

// Export current environment for debugging
export const CURRENT_ENV = getCurrentEnvironment();

export default API_ENDPOINTS;