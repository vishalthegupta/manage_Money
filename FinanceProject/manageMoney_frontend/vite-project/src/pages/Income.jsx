import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import IncomeSourceChart from '../components/charts/IncomeSourceChart';


const Income = () => {
  const { 
    financialData, 
    fetchFinancialSummary,
    token 
  } = useAuth();
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();
  
  // State management for enhanced functionality
  const [showAllIncomes, setShowAllIncomes] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    source: '',
    category: '',
    description: '',
    amount: '',
    date: ''
  });

  // Filter state management
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    timePeriod: '',
    category: '',
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

  // Get incomes sorted by date (newest first)
  const sortedIncomes = financialData.incomes
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display logic based on showAllIncomes state
  // Variables will be calculated after function definitions

  // API Functions
  const handleLoadAllIncomes = async () => {
    if (showAllIncomes) {
      setShowAllIncomes(false);
      return;
    }
    
    setIsLoadingMore(true);
    try {
      // Data is already loaded in financialData, just toggle view
      setShowAllIncomes(true);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    setIsDeleting(true);
    try {
      await ApiService.deleteIncome(incomeId);
      
      // Show success notification
      showSuccess('Income deleted successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting income:', error);
      showError('Failed to delete income. Please try again.', 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setEditFormData({
      source: income.source || '',
      category: income.category || '',
      description: income.description || '',
      amount: income.amount?.toString() || '',
      date: income.date ? income.date.split('T')[0] : ''
    });
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updateData = {
        source: editFormData.source,
        category: editFormData.category,
        description: editFormData.description,
        amount: parseFloat(editFormData.amount),
        date: editFormData.date
      };

      await ApiService.updateIncome(editingIncome.id, updateData);
      
      // Show success notification
      showSuccess('Income updated successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setEditingIncome(null);
    } catch (error) {
      console.error('Error updating income:', error);
      showError('Failed to update income. Please try again.', 5000);
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
    
    // Category filter
    if (filters.category) {
      newActiveFilters.push({ type: 'category', label: `Category: ${filters.category}`, value: filters.category });
    }
    
    // Amount range filter
    if (filters.amountRange) {
      let rangeLabel = '';
      switch (filters.amountRange) {
        case '0-1000':
          rangeLabel = '₹0 - ₹1,000';
          break;
        case '1000-5000':
          rangeLabel = '₹1,000 - ₹5,000';
          break;
        case '5000-10000':
          rangeLabel = '₹5,000 - ₹10,000';
          break;
        case '10000-25000':
          rangeLabel = '₹10,000 - ₹25,000';
          break;
        case '25000-50000':
          rangeLabel = '₹25,000 - ₹50,000';
          break;
        case '50000-100000':
          rangeLabel = '₹50,000 - ₹1,00,000';
          break;
        case '100000+':
          rangeLabel = '₹1,00,000+';
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
      category: '',
      amountRange: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Apply filters to income data
  const getFilteredIncomes = () => {
    if (activeFilters.length === 0) {
      return sortedIncomes;
    }
    
    return sortedIncomes.filter(income => {
      const incomeDate = new Date(income.date);
      const incomeAmount = parseFloat(income.amount);
      
      // Time period filter
      const timePeriodFilter = activeFilters.find(f => f.type === 'timePeriod');
      if (timePeriodFilter) {
        const now = new Date();
        let isInDateRange = false;
        
        switch (timePeriodFilter.value) {
          case 'thisMonth':
            isInDateRange = incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear();
            break;
          case 'lastMonth':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            isInDateRange = incomeDate.getMonth() === lastMonth.getMonth() && incomeDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'last3Months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            isInDateRange = incomeDate >= threeMonthsAgo;
            break;
          case 'last6Months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            isInDateRange = incomeDate >= sixMonthsAgo;
            break;
          case 'thisYear':
            isInDateRange = incomeDate.getFullYear() === now.getFullYear();
            break;
          case 'lastYear':
            isInDateRange = incomeDate.getFullYear() === (now.getFullYear() - 1);
            break;
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              const fromDate = new Date(filters.dateFrom);
              const toDate = new Date(filters.dateTo);
              isInDateRange = incomeDate >= fromDate && incomeDate <= toDate;
            }
            break;
        }
        
        if (!isInDateRange) return false;
      }
      
      // Category filter
      const categoryFilter = activeFilters.find(f => f.type === 'category');
      if (categoryFilter && income.category !== categoryFilter.value) {
        return false;
      }
      
      // Amount range filter
      const amountFilter = activeFilters.find(f => f.type === 'amountRange');
      if (amountFilter) {
        const [min, max] = amountFilter.value.split('-').map(v => v === '+' ? Infinity : parseFloat(v.replace(/[^0-9]/g, '')));
        if (max === undefined) {
          // Handle '100000+' case
          if (!isNaN(min) && incomeAmount < min) return false;
        } else {
          if (incomeAmount < min || incomeAmount > max) return false;
        }
      }
      
      return true;
    });
  };

  // Get filtered incomes for display
  const filteredIncomes = getFilteredIncomes();
  const displayedIncomes = showAllIncomes ? filteredIncomes : filteredIncomes.slice(0, 5);
  const hasMoreIncomes = filteredIncomes.length > 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Income Management" 
        subtitle="Track and manage your income"
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
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {formatCurrency(financialData.totalIncome)}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Total Income from {financialData.incomes.length} record(s)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/income/add')}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm sm:text-base">Add Income</span>
                </button>
              </div>
            </div>
          </div>

          {/* Income Analytics - Only show if there are incomes */}
          {financialData.incomes && financialData.incomes.length > 0 && (
            <div className="mt-8 mb-8">
              <div className="w-full">
                <IncomeSourceChart incomes={financialData.incomes} />
              </div>
            </div>
          )}

          {/* Recent Income */}
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  {showAllIncomes ? 'All Income Records' : 'Recent Income'}
                  {showAllIncomes && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({activeFilters.length > 0 ? `${filteredIncomes.length} filtered` : `${sortedIncomes.length} total`})
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
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-indigo-100 text-indigo-800"
                    >
                      <span>{filter.label}</span>
                      <button
                        onClick={() => removeFilter(filter)}
                        className="ml-1 sm:ml-2 text-indigo-600 hover:text-indigo-500"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Showing {filteredIncomes.length} of {sortedIncomes.length} income records
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {financialData.isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading income data...</p>
                </div>
              ) : displayedIncomes.length > 0 ? (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {displayedIncomes.map((income, index) => (
                    <div key={income.id || `income-${index}`} className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            {/* Enhanced Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Enhanced Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {income.source || 'Income Source'}
                                </h4>
                                {income.category && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 self-start sm:self-auto">
                                    💼 {income.category}
                                  </span>
                                )}
                              </div>
                              
                              {/* Description */}
                              {income.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                  📝 {income.description}
                                </p>
                              )}
                              
                              {/* Date and Additional Info */}
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{formatDate(income.date || income.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Amount Display */}
                          <div className="flex-shrink-0 text-right">
                            <div className="bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm border border-emerald-200">
                              <span className="text-sm sm:text-base lg:text-xl font-bold text-emerald-500 whitespace-nowrap">
                                +{formatCurrency(income.amount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-emerald-200">
                          <button
                            onClick={() => handleEditIncome(income)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(income.id)}
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
                </div>
                        
                {/* More/Less Button */}
                {hasMoreIncomes && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleLoadAllIncomes}
                      disabled={isLoadingMore}
                      className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Loading...
                        </>
                      ) : showAllIncomes ? (
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
                          Show All ({filteredIncomes.length} records)
                        </>
                      )}
                    </button>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p className="text-gray-500 text-base sm:text-lg">No income records found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Start by adding your first income source</p>
                  <button
                    onClick={() => navigate('/income/add')}
                    className="mt-3 sm:mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                  >
                    Add Your First Income
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setDeleteConfirmId(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.664 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this income record? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteIncome(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center order-1 sm:order-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Edit Income Record</h3>
                </div>
                <button
                  onClick={() => setEditingIncome(null)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateIncome} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Income Source *</label>
                  <input
                    type="text"
                    name="source"
                    value={editFormData.source}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Salary, Freelancing"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    <option value="Salary">💼 Salary</option>
                    <option value="Freelance">🔧 Freelance</option>
                    <option value="Investment">📈 Investment Returns</option>
                    <option value="Business">🏢 Business</option>
                    <option value="Rental">🏠 Rental Income</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional details about this income..."
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingIncome(null)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Income'
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
              <h3 className="text-lg font-semibold text-gray-900">Filter Income</h3>
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

              {/* Custom Date Range (show only when Custom is selected) */}
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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Investment">Investment</option>
                  <option value="Business">Business</option>
                  <option value="Rental">Rental</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Gift">Gift</option>
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
                  <option value="0-1000">₹0 - ₹1,000</option>
                  <option value="1000-5000">₹1,000 - ₹5,000</option>
                  <option value="5000-10000">₹5,000 - ₹10,000</option>
                  <option value="10000-25000">₹10,000 - ₹25,000</option>
                  <option value="25000-50000">₹25,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000+">₹1,00,000+</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setFilters({
                    timePeriod: '',
                    category: '',
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
                    // Apply filters logic will be implemented next
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

export default Income;