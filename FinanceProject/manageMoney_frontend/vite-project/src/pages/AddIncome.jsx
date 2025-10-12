import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import PageHeader from '../components/PageHeader';

const AddIncome = () => {
  const { userInfo, token, fetchFinancialSummary } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    source: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
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
      const incomeData = {
        source: formData.source,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date
      };

      await ApiService.createIncome(incomeData);

      setSuccess('Income added successfully!');
      showSuccess('Income added successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      
      // Reset form
      setFormData({
        source: '',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/income');
      }, 2000);

    } catch (err) {
      console.error('Failed to add income:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add income. Please try again.';
      setError(errorMessage);
      showError(errorMessage, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Add Income" 
        subtitle="Add a new income source to your portfolio"
        backUrl="/income"
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="bg-gradient-to-br from-white to-green-50 shadow-xl rounded-xl sm:rounded-2xl border border-green-100 overflow-hidden">
            <div className="px-4 py-4 sm:px-6 sm:py-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold truncate">
                    💰 Income Details
                  </h3>
                  <p className="text-green-100 text-xs sm:text-sm line-clamp-2">
                    Add a new income source to boost your financial portfolio
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 sm:px-6 sm:py-8 space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium animate-pulse text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border-2 border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium animate-pulse text-sm">
                  ✅ {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Amount */}
                <div className="group">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 transition-colors group-focus-within:text-green-600">
                    💰 Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium text-sm sm:text-base">₹</span>
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
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="group">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 transition-colors group-focus-within:text-green-600">
                    🏢 Income Source *
                  </label>
                  <input
                    type="text"
                    name="source"
                    id="source"
                    required
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                    placeholder="e.g., Salary, Freelance, Business"
                  />
                </div>

                {/* Category */}
                <div className="group">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 transition-colors group-focus-within:text-green-600">
                    🏷️ Category *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm font-medium bg-gray-50 focus:bg-white transition-all duration-200 ease-in-out focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-gray-300 hover:shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">💼 Select a category</option>
                    <option value="Salary">💼 Salary</option>
                    <option value="Freelance">🖥️ Freelance</option>
                    <option value="Business">🏢 Business</option>
                    <option value="Investment Returns">📈 Investment Returns</option>
                    <option value="Rental Income">🏠 Rental Income</option>
                    <option value="Side Hustle">💪 Side Hustle</option>
                    <option value="Bonus">🎁 Bonus</option>
                    <option value="Other">📋 Other</option>
                  </select>
                </div>

                {/* Date */}
                <div className="group">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 transition-colors group-focus-within:text-green-600">
                    📅 Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm font-medium bg-gray-50 focus:bg-white transition-all duration-200 ease-in-out focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-gray-300 hover:shadow-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 transition-colors group-focus-within:text-green-600">
                  📝 Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm font-medium placeholder-gray-400 bg-gray-50 focus:bg-white transition-all duration-200 ease-in-out focus:border-green-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-gray-300 hover:shadow-sm resize-none"
                  placeholder="💡 Describe this income source, frequency, and any additional details..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/income')}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-gray-100 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>❌</span>
                    <span>Cancel</span>
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-green-200 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Adding Income...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>💰</span>
                      <span className="text-sm sm:text-base">Add Income</span>
                    </div>
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

export default AddIncome;