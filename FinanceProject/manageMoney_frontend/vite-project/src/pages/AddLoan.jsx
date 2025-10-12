import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import PageHeader from '../components/PageHeader';

const AddLoan = () => {
  const { userInfo, token, fetchFinancialSummary } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    type: '',
    lender: '',
    description: '',
    principal: '',
    interestRate: '',
    emi: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
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
      const loanData = {
        type: formData.type,
        lender: formData.lender,
        description: formData.description,
        principal: parseFloat(formData.principal),
        interestRate: parseFloat(formData.interestRate),
        emi: parseFloat(formData.emi),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      await ApiService.createLoan(loanData);

      setSuccess('Loan added successfully!');
      showSuccess('Loan added successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      
      // Reset form
      setFormData({
        type: '',
        lender: '',
        description: '',
        principal: '',
        interestRate: '',
        emi: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/loans');
      }, 2000);

    } catch (err) {
      console.error('Failed to add loan:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add loan. Please try again.';
      setError(errorMessage);
      showError(errorMessage, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Add Loan" 
        subtitle="Track a new loan in your financial portfolio"
        backUrl="/loans"
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Loan Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Track your loan to manage your debt and payments
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
                {/* Loan Type */}
                <div className="group">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    🏦 Loan Type *
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select loan type</option>
                    <option value="Home">🏠 Home Loan</option>
                    <option value="Personal">👤 Personal Loan</option>
                    <option value="Education">🎓 Education Loan</option>
                    <option value="Vehicle">🚗 Vehicle Loan</option>
                    <option value="Business">🏢 Business Loan</option>
                    <option value="Credit Card">💳 Credit Card</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>

                {/* Lender */}
                <div className="group">
                  <label htmlFor="lender" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    🏦 Lender Name *
                  </label>
                  <input
                    type="text"
                    name="lender"
                    id="lender"
                    required
                    value={formData.lender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                    placeholder="e.g., SBI, HDFC, ICICI"
                  />
                </div>

                {/* Principal Amount */}
                <div className="group">
                  <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    💰 Principal Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      name="principal"
                      id="principal"
                      required
                      min="0"
                      step="0.01"
                      value={formData.principal}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="group">
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    📈 Interest Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="interestRate"
                      id="interestRate"
                      required
                      min="0"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                      placeholder="Enter rate"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                </div>

                {/* EMI */}
                <div className="group">
                  <label htmlFor="emi" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    💵 EMI Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      name="emi"
                      id="emi"
                      required
                      min="0"
                      step="0.01"
                      value={formData.emi}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                      placeholder="Enter EMI amount"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="group">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    📅 Loan Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* End Date */}
                <div className="group">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                    🕚 Loan End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-yellow-600">
                  📝 Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 focus:outline-none hover:border-gray-300 hover:shadow-sm bg-gray-50 focus:bg-white resize-none"
                  placeholder="Describe the purpose and details of this loan..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/loans')}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 bg-white transition-all duration-200 ease-in-out hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-100 active:scale-95"
                >
                  ← Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Adding Loan...</span>
                    </>
                  ) : (
                    <>
                      <span>🏦 Add Loan</span>
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

export default AddLoan;