import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import InvestmentPortfolioChart from '../components/charts/InvestmentPortfolioChart';

const Investments = () => {
  const { 
    financialData, 
    fetchFinancialSummary,
    token 
  } = useAuth();
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();
  
  // State management for edit/delete functionality
  const [showAllInvestments, setShowAllInvestments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: '',
    description: '',
    amount: '',
    date: ''
  });

  // Filter state management
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    timePeriod: '',
    type: '',
    amountRange: '',
    dateFrom: '',
    dateTo: ''
  });
  const [activeFilters, setActiveFilters] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handler functions for show more/less functionality
  const handleLoadAllInvestments = async () => {
    if (showAllInvestments) {
      setShowAllInvestments(false);
      return;
    }
    
    setIsLoadingMore(true);
    try {
      // Data is already loaded in financialData, just toggle view
      setShowAllInvestments(true);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handler functions for edit/delete functionality
  const handleDeleteInvestment = async (investmentId) => {
    setIsDeleting(true);
    try {
      await ApiService.deleteInvestment(investmentId);
      
      // Show success notification
      showSuccess('Investment deleted successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting investment:', error);
      showError('Failed to delete investment. Please try again.', 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    setEditFormData({
      name: investment.institution || '',
      type: investment.type || '',
      description: investment.description || '',
      amount: investment.amount?.toString() || '',
      date: investment.date ? investment.date.split('T')[0] : ''
    });
  };

  const handleUpdateInvestment = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updateData = {
        institution: editFormData.name,
        type: editFormData.type,
        description: editFormData.description,
        amount: parseFloat(editFormData.amount),
        date: editFormData.date
      };

      await ApiService.updateInvestment(editingInvestment.id, updateData);
      
      // Show success notification
      showSuccess('Investment updated successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setEditingInvestment(null);
    } catch (error) {
      console.error('Error updating investment:', error);
      showError('Failed to update investment. Please try again.', 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter logic functions
  const applyFilters = () => {
    const newActiveFilters = [];
    
    // Time period filter
    if (filters.timePeriod) {
      const now = new Date();
      let fromDate, toDate;
      
      switch (filters.timePeriod) {
        case 'thisMonth':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          newActiveFilters.push({ type: 'timePeriod', label: 'This Month', value: 'thisMonth' });
          break;
        case 'lastMonth':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          toDate = new Date(now.getFullYear(), now.getMonth(), 0);
          newActiveFilters.push({ type: 'timePeriod', label: 'Last Month', value: 'lastMonth' });
          break;
        case 'last3Months':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          toDate = now;
          newActiveFilters.push({ type: 'timePeriod', label: 'Last 3 Months', value: 'last3Months' });
          break;
        case 'last6Months':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          toDate = now;
          newActiveFilters.push({ type: 'timePeriod', label: 'Last 6 Months', value: 'last6Months' });
          break;
        case 'thisYear':
          fromDate = new Date(now.getFullYear(), 0, 1);
          toDate = new Date(now.getFullYear(), 11, 31);
          newActiveFilters.push({ type: 'timePeriod', label: 'This Year', value: 'thisYear' });
          break;
        case 'lastYear':
          fromDate = new Date(now.getFullYear() - 1, 0, 1);
          toDate = new Date(now.getFullYear() - 1, 11, 31);
          newActiveFilters.push({ type: 'timePeriod', label: 'Last Year', value: 'lastYear' });
          break;
        case 'custom':
          if (filters.dateFrom && filters.dateTo) {
            fromDate = new Date(filters.dateFrom);
            toDate = new Date(filters.dateTo);
            newActiveFilters.push({ type: 'timePeriod', label: `${filters.dateFrom} to ${filters.dateTo}`, value: 'custom' });
          }
          break;
      }
    }
    
    // Type filter
    if (filters.type) {
      newActiveFilters.push({ type: 'type', label: `Type: ${filters.type}`, value: filters.type });
    }
    
    // Amount range filter
    if (filters.amountRange) {
      let rangeLabel = '';
      switch (filters.amountRange) {
        case '0-10000':
          rangeLabel = '₹0 - ₹10,000';
          break;
        case '10000-50000':
          rangeLabel = '₹10,000 - ₹50,000';
          break;
        case '50000-100000':
          rangeLabel = '₹50,000 - ₹1,00,000';
          break;
        case '100000-500000':
          rangeLabel = '₹1,00,000 - ₹5,00,000';
          break;
        case '500000-1000000':
          rangeLabel = '₹5,00,000 - ₹10,00,000';
          break;
        case '1000000+':
          rangeLabel = '₹10,00,000+';
          break;
      }
      newActiveFilters.push({ type: 'amountRange', label: rangeLabel, value: filters.amountRange });
    }
    
    setActiveFilters(newActiveFilters);
  };

  const removeFilter = (filterToRemove) => {
    setActiveFilters(prev => prev.filter(filter => filter.type !== filterToRemove.type));
    
    if (filterToRemove.type === 'timePeriod' && filterToRemove.value === 'custom') {
      setFilters(prev => ({
        ...prev,
        timePeriod: '',
        dateFrom: '',
        dateTo: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterToRemove.type]: ''
      }));
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilters({
      timePeriod: '',
      type: '',
      amountRange: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Apply filters to investment data
  const getFilteredInvestments = () => {
    if (activeFilters.length === 0) {
      return sortedInvestments;
    }
    
    return sortedInvestments.filter(investment => {
      const investmentDate = new Date(investment.date);
      const investmentAmount = parseFloat(investment.amount);
      
      // Time period filter
      const timePeriodFilter = activeFilters.find(f => f.type === 'timePeriod');
      if (timePeriodFilter) {
        const now = new Date();
        let isInDateRange = false;
        
        switch (timePeriodFilter.value) {
          case 'thisMonth':
            isInDateRange = investmentDate.getMonth() === now.getMonth() && investmentDate.getFullYear() === now.getFullYear();
            break;
          case 'lastMonth':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            isInDateRange = investmentDate.getMonth() === lastMonth.getMonth() && investmentDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'last3Months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            isInDateRange = investmentDate >= threeMonthsAgo;
            break;
          case 'last6Months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            isInDateRange = investmentDate >= sixMonthsAgo;
            break;
          case 'thisYear':
            isInDateRange = investmentDate.getFullYear() === now.getFullYear();
            break;
          case 'lastYear':
            isInDateRange = investmentDate.getFullYear() === (now.getFullYear() - 1);
            break;
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              const fromDate = new Date(filters.dateFrom);
              const toDate = new Date(filters.dateTo);
              isInDateRange = investmentDate >= fromDate && investmentDate <= toDate;
            }
            break;
        }
        
        if (!isInDateRange) return false;
      }
      
      // Type filter
      const typeFilter = activeFilters.find(f => f.type === 'type');
      if (typeFilter && investment.type !== typeFilter.value) {
        return false;
      }
      
      // Amount range filter
      const amountFilter = activeFilters.find(f => f.type === 'amountRange');
      if (amountFilter) {
        const [min, max] = amountFilter.value.split('-').map(v => v === '+' ? Infinity : parseFloat(v.replace(/[^0-9]/g, '')));
        if (max === undefined) {
          // Handle '1000000+' case
          if (!isNaN(min) && investmentAmount < min) return false;
        } else {
          if (investmentAmount < min || investmentAmount > max) return false;
        }
      }
      
      return true;
    });
  };

  const sortedInvestments = financialData.investments
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get filtered investments for display
  const filteredInvestments = getFilteredInvestments();
  const displayedInvestments = showAllInvestments ? filteredInvestments : filteredInvestments.slice(0, 5);
  const hasMoreInvestments = filteredInvestments.length > 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Investment Management" 
        subtitle="Track and manage your investment portfolio"
        backUrl="/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Summary Card */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg sm:rounded-xl mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center min-w-0 flex-1">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {formatCurrency(financialData.totalInvestments)}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Total Portfolio Value from {financialData.investments.length} investments</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/investments/add')}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm sm:text-base">Add Investment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Investment Analytics - Only show if there are investments */}
          {financialData.investments && financialData.investments.length > 0 && (
            <div className="mt-8 mb-8">
              <div className="w-full">
                <InvestmentPortfolioChart investments={financialData.investments} />
              </div>
            </div>
          )}

          {/* Recent Investments */}
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  {showAllInvestments ? 'All Investment Records' : 'Recent Investments'}
                  {showAllInvestments && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({activeFilters.length > 0 ? `${filteredInvestments.length} filtered` : `${sortedInvestments.length} total`})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="hidden sm:inline">Filter</span>
                  <span className="sm:hidden">⚡</span>
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800"
                    >
                      <span>{filter.label}</span>
                      <button
                        onClick={() => removeFilter(filter)}
                        className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-500"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Showing {filteredInvestments.length} of {sortedInvestments.length} investment records
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {financialData.isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading investment data...</p>
                </div>
              ) : displayedInvestments.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {displayedInvestments.map((investment, index) => (
                    <div key={investment.id || `investment-${index}`} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            {/* Enhanced Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Enhanced Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {investment.institution || investment.description || 'Investment'}
                                </h4>
                                {investment.type && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start sm:self-auto">
                                    📈 {investment.type}
                                  </span>
                                )}
                              </div>
                              
                              {/* Description */}
                              {investment.description && investment.institution && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                  📝 {investment.description}
                                </p>
                              )}
                              
                              {/* Date and Additional Info */}
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{formatDate(investment.date || investment.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Amount Display */}
                          <div className="flex-shrink-0 text-right">
                            <div className="bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm border border-blue-200">
                              <span className="text-sm sm:text-base lg:text-xl font-bold text-blue-600 whitespace-nowrap">
                                {formatCurrency(investment.amount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-blue-200">
                          <button
                            onClick={() => handleEditInvestment(investment)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(investment.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-md hover:bg-red-100 transition-colors duration-200 border border-red-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show More/Less Button */}
                  {hasMoreInvestments && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <button
                        onClick={handleLoadAllInvestments}
                        disabled={isLoadingMore}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading...
                          </>
                        ) : showAllInvestments ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Show Less
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show All ({filteredInvestments.length} records)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-gray-500 text-base sm:text-lg">No investment records found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Start building your investment portfolio</p>
                  <button
                    onClick={() => navigate('/investments/add')}
                    className="mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                  >
                    Add Your First Investment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Investment</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this investment? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteInvestment(deleteConfirmId)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Investment Modal */}
      {editingInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Edit Investment Record</h3>
                </div>
                <button
                  onClick={() => setEditingInvestment(null)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateInvestment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution/Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Zerodha, HDFC Bank"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type *</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="Stocks">📈 Stocks</option>
                    <option value="Mutual Funds">🏛️ Mutual Funds</option>
                    <option value="Fixed Deposit">🏦 Fixed Deposit</option>
                    <option value="Real Estate">🏠 Real Estate</option>
                    <option value="Gold">🥇 Gold</option>
                    <option value="Cryptocurrency">₿ Cryptocurrency</option>
                    <option value="Bonds">📋 Bonds</option>
                    <option value="SIP">💰 SIP</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional details about this investment..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingInvestment(null)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Investment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Filter Investments</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Time Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={filters.timePeriod}
                  onChange={(e) => setFilters(prev => ({ ...prev, timePeriod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Time</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="last3Months">Last 3 Months</option>
                  <option value="last6Months">Last 6 Months</option>
                  <option value="thisYear">This Year</option>
                  <option value="lastYear">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {filters.timePeriod === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Investment Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Fixed Deposits">Fixed Deposits</option>
                  <option value="Bonds">Bonds</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Gold">Gold</option>
                  <option value="Crypto">Cryptocurrency</option>
                  <option value="PPF">PPF</option>
                  <option value="SIP">SIP</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any Amount</option>
                  <option value="0-10000">₹0 - ₹10,000</option>
                  <option value="10000-50000">₹10,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                  <option value="500000-1000000">₹5,00,000 - ₹10,00,000</option>
                  <option value="1000000+">₹10,00,000+</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setFilters({
                    timePeriod: '',
                    type: '',
                    amountRange: '',
                    dateFrom: '',
                    dateTo: ''
                  });
                  setActiveFilters([]);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Clear All
              </button>
              <div className="flex space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    applyFilters();
                    setShowFilterModal(false);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;