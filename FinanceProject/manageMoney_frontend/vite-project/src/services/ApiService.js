import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINTS, buildApiUrl, API_CONFIG_OPTIONS } from '../config/api.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: API_CONFIG_OPTIONS.timeout,
  headers: API_CONFIG_OPTIONS.headers,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Auth methods
  static async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  }

  static async register(formData) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, formData);
    return response.data;
  }

  static async getMe() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  // User methods
  static async updateProfile(userId, updateData) {
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE(userId), updateData);
    return response.data;
  }

  // Income methods
  static async createIncome(incomeData) {
    const response = await apiClient.post(API_ENDPOINTS.INCOME.CREATE, incomeData);
    return response.data;
  }

  static async getAllIncome(userId) {
    const response = await apiClient.get(API_ENDPOINTS.INCOME.GET_ALL(userId));
    return response.data;
  }

  static async updateIncome(id, updateData) {
    const response = await apiClient.put(API_ENDPOINTS.INCOME.UPDATE(id), updateData);
    return response.data;
  }

  static async deleteIncome(id) {
    const response = await apiClient.delete(API_ENDPOINTS.INCOME.DELETE(id));
    return response.data;
  }

  // Expense methods
  static async createExpense(expenseData) {
    const response = await apiClient.post(API_ENDPOINTS.EXPENSE.CREATE, expenseData);
    return response.data;
  }

  static async getAllExpenses(userId) {
    const response = await apiClient.get(API_ENDPOINTS.EXPENSE.GET_ALL(userId));
    return response.data;
  }

  static async updateExpense(id, updateData) {
    const response = await apiClient.put(API_ENDPOINTS.EXPENSE.UPDATE(id), updateData);
    return response.data;
  }

  static async deleteExpense(id) {
    const response = await apiClient.delete(API_ENDPOINTS.EXPENSE.DELETE(id));
    return response.data;
  }

  // Investment methods
  static async createInvestment(investmentData) {
    const response = await apiClient.post(API_ENDPOINTS.INVESTMENT.CREATE, investmentData);
    return response.data;
  }

  static async getAllInvestments(userId) {
    const response = await apiClient.get(API_ENDPOINTS.INVESTMENT.GET_ALL(userId));
    return response.data;
  }

  static async updateInvestment(id, updateData) {
    const response = await apiClient.put(API_ENDPOINTS.INVESTMENT.UPDATE(id), updateData);
    return response.data;
  }

  static async deleteInvestment(id) {
    const response = await apiClient.delete(API_ENDPOINTS.INVESTMENT.DELETE(id));
    return response.data;
  }

  // Loan methods
  static async createLoan(loanData) {
    const response = await apiClient.post(API_ENDPOINTS.LOAN.CREATE, loanData);
    return response.data;
  }

  static async getAllLoans(userId) {
    const response = await apiClient.get(API_ENDPOINTS.LOAN.GET_ALL(userId));
    return response.data;
  }

  static async updateLoan(id, updateData) {
    const response = await apiClient.put(API_ENDPOINTS.LOAN.UPDATE(id), updateData);
    return response.data;
  }

  static async deleteLoan(id) {
    const response = await apiClient.delete(API_ENDPOINTS.LOAN.DELETE(id));
    return response.data;
  }

  // Generic methods for custom endpoints
  static async get(endpoint, config = {}) {
    const response = await apiClient.get(endpoint, config);
    return response.data;
  }

  static async post(endpoint, data = {}, config = {}) {
    const response = await apiClient.post(endpoint, data, config);
    return response.data;
  }

  static async put(endpoint, data = {}, config = {}) {
    const response = await apiClient.put(endpoint, data, config);
    return response.data;
  }

  static async delete(endpoint, config = {}) {
    const response = await apiClient.delete(endpoint, config);
    return response.data;
  }
}

export default ApiService;