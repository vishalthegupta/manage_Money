import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import ExpensePieChart from '../components/charts/ExpensePieChart';


const Expenses = () => {
  const { 
    financialData, 
    fetchFinancialSummary,
    token 
  } = useAuth();
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();

  // State for edit/delete functionality
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: '',
    paymentMode: ''
  });

  // Filter state management
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    timePeriod: '',
    category: '',
    amountRange: '',
    paymentMode: '',
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

  // Handler functions for edit/delete functionality
  const handleLoadAllExpenses = async () => {
    if (showAllExpenses) {
      setShowAllExpenses(false);
      return;
    }
    
    setIsLoadingMore(true);
    try {
      // Data is already loaded in financialData, just toggle view
      setShowAllExpenses(true);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setIsDeleting(true);
    try {
      await ApiService.deleteExpense(expenseId);
      
      // Show success notification
      showSuccess('Expense deleted successfully!', 3000);
      
      await fetchFinancialSummary();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      showError('Failed to delete expense. Please try again.', 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditFormData({
      description: expense.description || '',
      category: expense.category || '',
      amount: expense.amount?.toString() || '',
      date: expense.date ? expense.date.split('T')[0] : '',
      paymentMode: expense.paymentMode || ''
    });
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updateData = {
        description: editFormData.description,
        category: editFormData.category,
        amount: parseFloat(editFormData.amount),
        date: editFormData.date,
        paymentMode: editFormData.paymentMode
      };

      await ApiService.updateExpense(editingExpense.id, updateData);
      
      // Show success notification
      showSuccess('Expense updated successfully!', 3000);
      
      await fetchFinancialSummary();
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      showError('Failed to update expense. Please try again.', 5000);
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
    
    // Payment Mode filter
    if (filters.paymentMode) {
      newActiveFilters.push({ type: 'paymentMode', label: `Payment: ${filters.paymentMode}`, value: filters.paymentMode });
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
      paymentMode: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Apply filters to expense data
  const getFilteredExpenses = () => {
    if (activeFilters.length === 0) {
      return sortedExpenses;
    }
    
    return sortedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseAmount = parseFloat(expense.amount);
      
      // Time period filter
      const timePeriodFilter = activeFilters.find(f => f.type === 'timePeriod');
      if (timePeriodFilter) {
        const now = new Date();
        let isInDateRange = false;
        
        switch (timePeriodFilter.value) {
          case 'thisMonth':
            isInDateRange = expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
            break;
          case 'lastMonth':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            isInDateRange = expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'last3Months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            isInDateRange = expenseDate >= threeMonthsAgo;
            break;
          case 'last6Months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            isInDateRange = expenseDate >= sixMonthsAgo;
            break;
          case 'thisYear':
            isInDateRange = expenseDate.getFullYear() === now.getFullYear();
            break;
          case 'lastYear':
            isInDateRange = expenseDate.getFullYear() === (now.getFullYear() - 1);
            break;
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              const fromDate = new Date(filters.dateFrom);
              const toDate = new Date(filters.dateTo);
              isInDateRange = expenseDate >= fromDate && expenseDate <= toDate;
            }
            break;
        }
        
        if (!isInDateRange) return false;
      }
      
      // Category filter
      const categoryFilter = activeFilters.find(f => f.type === 'category');
      if (categoryFilter && expense.category !== categoryFilter.value) {
        return false;
      }
      
      // Payment Mode filter
      const paymentModeFilter = activeFilters.find(f => f.type === 'paymentMode');
      if (paymentModeFilter && expense.paymentMode !== paymentModeFilter.value) {
        return false;
      }
      
      // Amount range filter
      const amountFilter = activeFilters.find(f => f.type === 'amountRange');
      if (amountFilter) {
        const [min, max] = amountFilter.value.split('-').map(v => v === '+' ? Infinity : parseFloat(v.replace(/[^0-9]/g, '')));
        if (max === undefined) {
          // Handle '100000+' case
          if (!isNaN(min) && expenseAmount < min) return false;
        } else {
          if (expenseAmount < min || expenseAmount > max) return false;
        }
      }
      
      return true;
    });
  };

  const sortedExpenses = financialData.expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get filtered expenses for display
  const filteredExpenses = getFilteredExpenses();
  const displayedExpenses = showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 5);
  const hasMoreExpenses = filteredExpenses.length > 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Expense Management" 
        subtitle="Track and manage your expenses"
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
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {formatCurrency(financialData.totalExpenses)}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Total Expenses from {financialData.expenses.length} entries</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/expenses/add')}
                  className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm sm:text-base">Add Expense</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expense Analytics - Only show if there are expenses */}
          {financialData.expenses && financialData.expenses.length > 0 && (
            <div className="mt-8 mb-8">
              <div className="w-full">
                <ExpensePieChart expenses={financialData.expenses} />
              </div>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  {showAllExpenses ? 'All Expense Records' : 'Recent Expenses'}
                  {showAllExpenses && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({activeFilters.length > 0 ? `${filteredExpenses.length} filtered` : `${sortedExpenses.length} total`})
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
                  Showing {filteredExpenses.length} of {sortedExpenses.length} expense records
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {financialData.isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading expense data...</p>
                </div>
              ) : displayedExpenses.length > 0 ? (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {displayedExpenses.map((expense, index) => (
                    <div key={expense.id || `expense-${index}`} className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-rose-200 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            {/* Enhanced Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-400 to-rose-500 rounded-lg flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Enhanced Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                  {expense.description || 'Expense'}
                                </h4>
                                {expense.category && (
                                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                    🏷️ {expense.category}
                                  </span>
                                )}
                              </div>
                              
                              {/* Additional Info Display */}
                              {expense.paymentMode && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                  💳 {expense.paymentMode}
                                </p>
                              )}
                              
                              {/* Date and Additional Info */}
                              <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{formatDate(expense.date || expense.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Amount Display */}
                          <div className="flex-shrink-0 text-right ml-2 sm:ml-4">
                            <div className="bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-rose-200">
                              <span className="text-lg sm:text-xl font-bold text-rose-500">
                                -{formatCurrency(expense.amount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex justify-end space-x-2 pt-2 border-t border-rose-100">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-md hover:bg-rose-100 transition-colors duration-200 border border-rose-200"
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
                  {hasMoreExpenses && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadAllExpenses}
                        disabled={isLoadingMore}
                        className="inline-flex items-center px-6 py-2 border border-rose-300 rounded-md shadow-sm text-sm font-medium text-rose-600 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500 mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show All ({filteredExpenses.length} records)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {showAllExpenses && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllExpenses(false)}
                        className="inline-flex items-center px-6 py-2 border border-rose-300 rounded-md shadow-sm text-sm font-medium text-rose-600 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show Less
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No expense records found</p>
                  <p className="text-gray-400 text-sm mt-1">Start by adding your first expense</p>
                  <button
                    onClick={() => navigate('/expenses/add')}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Your First Expense
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Expense</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteExpense(deleteConfirmId)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Edit Expense Record</h3>
                </div>
                <button
                  onClick={() => setEditingExpense(null)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Groceries, Utilities"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    <option value="Food">🍽️ Food & Dining</option>
                    <option value="Transportation">🚗 Transportation</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Bills">📄 Bills & Utilities</option>
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Education">📚 Education</option>
                    <option value="Travel">✈️ Travel</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={editFormData.paymentMode}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="Card">💳 Card</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="Bank Transfer">🏦 Bank Transfer</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Expense'
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
              <h3 className="text-lg font-semibold text-gray-900">Filter Expenses</h3>
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

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Bills">Bills</option>
                  <option value="Education">Education</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                <select
                  value={filters.paymentMode}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Payment Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cheque">Cheque</option>
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
                    paymentMode: '',
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

export default Expenses;