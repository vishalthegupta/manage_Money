# API Configuration Documentation

This document explains the centralized API configuration system implemented in the Finance Management application.

## Overview

The API configuration has been centralized to improve maintainability and make environment-specific deployments easier. Instead of hardcoding API URLs throughout the application, we now use a centralized configuration system.

## Files Structure

```
src/
├── config/
│   └── api.js              # API endpoints and configuration
├── services/
│   └── ApiService.js       # API service layer with axios client
└── [components/pages...]   # Updated to use ApiService
```

## Configuration Files

### 1. `src/config/api.js`

This file contains:
- **Environment-specific configurations** (development, staging, production)
- **API endpoint definitions** organized by feature
- **Helper functions** for building URLs
- **Configuration options** like timeouts and headers

```javascript
// Example usage
import { API_ENDPOINTS, buildApiUrl } from '../config/api.js';

// Access base URL
const baseUrl = API_ENDPOINTS.BASE_URL;

// Access specific endpoints
const loginEndpoint = API_ENDPOINTS.AUTH.LOGIN;
const userIncomeEndpoint = API_ENDPOINTS.INCOME.GET_ALL(userId);
```

### 2. `src/services/ApiService.js`

This service provides:
- **Axios instance** with pre-configured base URL and headers
- **Request/Response interceptors** for authentication and error handling
- **Typed API methods** for all endpoints
- **Generic methods** for custom requests

```javascript
// Example usage
import ApiService from '../services/ApiService.js';

// Use typed methods
const user = await ApiService.getMe();
const incomes = await ApiService.getAllIncome(userId);
await ApiService.createIncome(incomeData);
await ApiService.updateIncome(id, updateData);
await ApiService.deleteIncome(id);

// Use generic methods
const customData = await ApiService.get('/api/custom-endpoint');
```

## Environment Configuration

The system automatically detects the environment and uses the appropriate configuration:

- **Development**: `http://localhost:8080` (current setup)
- **Production**: `https://your-production-api.com` (update before deployment)
- **Staging**: `https://your-staging-api.com` (optional)

### To Change Base URL for Different Environments:

1. Open `src/config/api.js`
2. Update the respective environment configuration:

```javascript
const API_CONFIG = {
  production: {
    baseURL: 'https://your-actual-production-url.com', // Update this
    timeout: 15000,
  },
  // ... other environments
};
```

## Features

### ✅ Automatic Authentication
- All requests automatically include the JWT token from cookies
- Automatic token refresh handling
- Automatic redirect to login on 401 errors

### ✅ Centralized Error Handling
- Common error responses handled in interceptors
- Consistent error handling across the application

### ✅ Type Safety
- Structured endpoint definitions
- Consistent parameter patterns
- Clear API method signatures

### ✅ Environment Management
- Easy switching between development/staging/production
- Environment-specific timeouts and configurations
- Debug information available

## Migration Summary

The following files have been updated to use the new API system:

### Updated Files:
- ✅ `src/context/AuthContext.jsx` - Authentication and financial data fetching
- ✅ `src/pages/EditProfile.jsx` - Profile updates
- ✅ `src/pages/AddIncome.jsx` - Income creation
- ✅ `src/pages/AddExpense.jsx` - Expense creation
- ✅ `src/pages/AddInvestment.jsx` - Investment creation
- ✅ `src/pages/AddLoan.jsx` - Loan creation
- ✅ `src/pages/Income.jsx` - Income CRUD operations
- ✅ `src/pages/Expenses.jsx` - Expense CRUD operations
- ✅ `src/pages/Investments.jsx` - Investment CRUD operations
- ✅ `src/pages/Loans.jsx` - Loan CRUD operations

### Changes Made:
- Removed direct `axios` imports
- Replaced hardcoded URLs with `ApiService` method calls
- Removed manual header management (now handled automatically)
- Simplified error handling (centralized in service layer)

## Benefits

1. **Maintainability**: Single place to update API URLs and configurations
2. **Environment Management**: Easy deployment to different environments
3. **Consistency**: Standardized API calling patterns
4. **Error Handling**: Centralized error management and retry logic
5. **Security**: Automatic token management and secure defaults
6. **Developer Experience**: Clear, typed API methods with better IDE support

## Usage Examples

### Basic CRUD Operations
```javascript
// Create
const newIncome = await ApiService.createIncome({
  source: 'Salary',
  amount: 5000,
  date: '2024-01-01'
});

// Read
const incomes = await ApiService.getAllIncome(userId);

// Update
await ApiService.updateIncome(incomeId, {
  amount: 5500
});

// Delete
await ApiService.deleteIncome(incomeId);
```

### Custom API Calls
```javascript
// For endpoints not covered by typed methods
const customData = await ApiService.get('/api/custom-endpoint');
const result = await ApiService.post('/api/custom-action', { data });
```

## Future Enhancements

Potential improvements for the API system:

1. **Request Caching**: Add caching layer for frequently accessed data
2. **Offline Support**: Queue requests when offline and sync when online
3. **Request Retry**: Automatic retry logic for failed requests
4. **Loading States**: Built-in loading state management
5. **Request Cancellation**: Cancel in-flight requests when components unmount

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update backend CORS configuration to allow requests from frontend domain
2. **401 Errors**: Check if JWT token is valid and not expired
3. **Connection Errors**: Verify backend server is running and accessible
4. **Environment Issues**: Ensure correct base URL is configured for your deployment environment

### Debug Information:

The current environment and configuration can be accessed:
```javascript
import { CURRENT_ENV, API_ENDPOINTS } from '../config/api.js';
console.log('Current Environment:', CURRENT_ENV);
console.log('Base URL:', API_ENDPOINTS.BASE_URL);
```