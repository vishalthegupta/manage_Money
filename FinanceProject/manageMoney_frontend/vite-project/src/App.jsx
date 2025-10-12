import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Investments from './pages/Investments';
import Loans from './pages/Loans';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import AddInvestment from './pages/AddInvestment';
import AddLoan from './pages/AddLoan';

// Component to handle authenticated user redirects
const AuthenticatedRedirect = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
// Layout component for authenticated pages with footer
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
};
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AuthenticatedLayout>
        <div className="App">
          <Routes>
            {/* Public routes - redirect to dashboard if already authenticated */}
            <Route 
              path="/login" 
              element={
                <AuthenticatedRedirect>
                  <Login />
                </AuthenticatedRedirect>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthenticatedRedirect>
                  <Register />
                </AuthenticatedRedirect>
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-profile" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Financial Management Routes */}
            <Route 
              path="/income" 
              element={
                <ProtectedRoute>
                  <Income />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/income/add" 
              element={
                <ProtectedRoute>
                  <AddIncome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses/add" 
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investments" 
              element={
                <ProtectedRoute>
                  <Investments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investments/add" 
              element={
                <ProtectedRoute>
                  <AddInvestment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loans" 
              element={
                <ProtectedRoute>
                  <Loans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loans/add" 
              element={
                <ProtectedRoute>
                  <AddLoan />
                </ProtectedRoute>
              } 
            />
            
            /* Default redirect */
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        </AuthenticatedLayout>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;