import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import ApiService from "../services/ApiService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [token , setToken] = useState(Cookies.get("token") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Financial data global state
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    totalLoans: 0,
    incomes: [],
    expenses: [],
    investments: [],
    loans: [],
    lastUpdated: null,
    isLoading: false
  });

  //  Check auth state on first mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setIsLoading(false);
        setToken(token);
        return;
      }

      try {
        const user = await ApiService.getMe(); // ProfileDTO: { id, email, fullName, phone }
        setUserId(user.id);
        setUserInfo(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        logout(); // Clear invalid token
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register method
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const authResponse = await ApiService.register(formData); // AuthResponse: { token, type, id, email, fullName }

      // Store token in cookies with security flags
      Cookies.set("token", authResponse.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Set global states
      setUserId(authResponse.id);
      setToken(authResponse.token);
      setUserInfo({
        id: authResponse.id,
        email: authResponse.email,
        fullName: authResponse.fullName
      });
      setIsAuthenticated(true);

      return authResponse;
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login method
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const authResponse = await ApiService.login(credentials); // AuthResponse: { token, type, id, email, fullName }

      // Store token in cookies with security flags
      Cookies.set("token", authResponse.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Set global states
      setUserId(authResponse.id);
      setToken(authResponse.token);
      setUserInfo({
        id: authResponse.id,
        email: authResponse.email,
        fullName: authResponse.fullName
      });
      setIsAuthenticated(true);

      return authResponse;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Method to fetch financial summary
  const fetchFinancialSummary = async () => {
    if (!userId || !token) {
      console.log('No user ID or token available for financial data fetch');
      return;
    }
    
    setFinancialData(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Fetching financial data for user:', userId);
      
      // Fetch all financial data in parallel
      const [incomeRes, expensesRes, investmentsRes, loansRes] = await Promise.allSettled([
        ApiService.getAllIncome(userId),
        ApiService.getAllExpenses(userId),
        ApiService.getAllInvestments(userId),
        ApiService.getAllLoans(userId)
      ]);

      // Process results with fallback values
      const incomes = incomeRes.status === 'fulfilled' ? (incomeRes.value || []) : [];
      const expenses = expensesRes.status === 'fulfilled' ? (expensesRes.value || []) : [];
      const investments = investmentsRes.status === 'fulfilled' ? (investmentsRes.value || []) : [];
      const loans = loansRes.status === 'fulfilled' ? (loansRes.value || []) : [];

      // Calculate totals
      const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalInvestments = investments.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalLoans = loans.reduce((sum, item) => sum + (item.amount || 0), 0);

      setFinancialData({
        totalIncome,
        totalExpenses,
        totalInvestments,
        totalLoans,
        incomes,
        expenses,
        investments,
        loans,
        lastUpdated: new Date(),
        isLoading: false
      });

      console.log('Financial data updated successfully');
      
    } catch (error) {
      console.error('Failed to fetch financial summary:', error);
      setFinancialData(prev => ({ 
        ...prev, 
        isLoading: false,
        lastUpdated: new Date() // Still update timestamp to avoid repeated failed calls
      }));
    }
  };

  // Method to refresh financial data (can be called from components)
  const refreshFinancialData = () => {
    fetchFinancialSummary();
  };

  // Method to check if financial data is stale (older than 5 minutes)
  const isFinancialDataStale = () => {
    if (!financialData.lastUpdated) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return financialData.lastUpdated < fiveMinutesAgo;
  };

  //  Logout method
  const logout = () => {
    Cookies.remove("token");
    setUserId(null);
    setUserInfo(null);
    setIsAuthenticated(false);
    setToken(null);
    // Clear financial data on logout
    setFinancialData({
      totalIncome: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      totalLoans: 0,
      incomes: [],
      expenses: [],
      investments: [],
      loans: [],
      lastUpdated: null,
      isLoading: false
    });
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const user = await ApiService.getMe();
      setUserInfo(user);
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
      // Don't logout on profile refresh failure, token might still be valid
    }
  };


  return (
    <AuthContext.Provider
      value={{
        userId,
        userInfo,
        isLoading,
        isAuthenticated,
        token,
        financialData,
        register,
        login,
        logout,
        refreshUserProfile,
        fetchFinancialSummary,
        refreshFinancialData,
        isFinancialDataStale,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
