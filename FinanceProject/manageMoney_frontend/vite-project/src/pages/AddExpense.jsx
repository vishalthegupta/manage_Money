import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import PageHeader from '../components/PageHeader';

const AddExpense = () => {
  const { userInfo, token, fetchFinancialSummary } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const expenseData = {
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        paymentMode: formData.paymentMode
      };

      await ApiService.createExpense(expenseData);

      setSuccess('Expense added successfully!');
      showSuccess('Expense added successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      
      // Reset form
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: ''
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/expenses');
      }, 2000);

    } catch (err) {
      console.error('Failed to add expense:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add expense. Please try again.';
      setError(errorMessage);
      showError(errorMessage, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Add Expense" 
        subtitle="Track a new expense in your budget"
        backUrl="/expenses"
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Expense Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Record your expense to track your spending
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium animate-pulse">
                  ❌ {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium animate-pulse">
                  ✅ {success}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Amount */}
                <div className="group">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                    💸 Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="group">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                    🏷️ Category *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    <option value="Food & Dining">🍽️ Food & Dining</option>
                    <option value="Transportation">🚗 Transportation</option>
                    <option value="Shopping">🛒 Shopping</option>
                    <option value="Bills & Utilities">🔌 Bills & Utilities</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Travel">✈️ Travel</option>
                    <option value="Education">📚 Education</option>
                    <option value="Groceries">🥕 Groceries</option>
                    <option value="Rent">🏠 Rent</option>
                    <option value="Insurance">🛡️ Insurance</option>
                    <option value="Personal Care">💄 Personal Care</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>

                {/* Payment Mode */}
                <div className="group">
                  <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                    💳 Payment Mode *
                  </label>
                  <select
                    name="paymentMode"
                    id="paymentMode"
                    required
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select payment mode</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="Credit Card">💳 Credit Card</option>
                    <option value="Debit Card">💸 Debit Card</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="Net Banking">🏦 Net Banking</option>
                    <option value="Wallet">👛 Digital Wallet</option>
                    <option value="Cheque">📝 Cheque</option>
                    <option value="Other">🔄 Other</option>
                  </select>
                </div>

                {/* Date */}
                <div className="group">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                    📅 Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
                  📝 Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white resize-none"
                  placeholder="What did you spend on? Be specific..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/expenses')}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white transition-all duration-200 ease-in-out hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-100 active:scale-95"
                >
                  ← Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Adding Expense...</span>
                    </>
                  ) : (
                    <>
                      <span>💸 Add Expense</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddExpense;