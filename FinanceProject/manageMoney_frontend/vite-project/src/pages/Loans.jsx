import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import LoanOverviewChart from '../components/charts/LoanOverviewChart';

const Loans = () => {
  const { 
    financialData, 
    fetchFinancialSummary,
    token 
  } = useAuth();
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();
  
  // State management for edit/delete functionality
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
  const [editFormData, setEditFormData] = useState({
    lender: '',
    type: '',
    description: '',
    principal: '',
    interestRate: '',
    startDate: '',
    endDate: ''
  });

  // Calculate total principal amount of all loans
  const calculateTotalLoanPrincipal = () => {
    if (!financialData.loans || financialData.loans.length === 0) {
      return 0;
    }
    
    return financialData.loans.reduce((total, loan) => {
      const principal = parseFloat(loan.principal) || 0;
      return total + principal;
    }, 0);
  };

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

  // Filter logic functions
  const applyFilters = () => {
    const newActiveFilters = [];
    
    if (filters.timePeriod) {
      const periodLabels = {
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        last3Months: 'Last 3 Months',
        last6Months: 'Last 6 Months',
        thisYear: 'This Year',
        lastYear: 'Last Year',
        custom: 'Custom Range'
      };
      newActiveFilters.push({
        type: 'timePeriod',
        label: periodLabels[filters.timePeriod] || filters.timePeriod,
        value: filters.timePeriod
      });
    }
    
    if (filters.type) {
      newActiveFilters.push({
        type: 'type',
        label: filters.type,
        value: filters.type
      });
    }
    
    if (filters.amountRange) {
      const rangeLabels = {
        '0-10000': '₹0 - ₹10K',
        '10000-50000': '₹10K - ₹50K',
        '50000-100000': '₹50K - ₹1L',
        '100000-500000': '₹1L - ₹5L',
        '500000-1000000': '₹5L - ₹10L',
        '1000000+': '₹10L+'
      };
      newActiveFilters.push({
        type: 'amountRange',
        label: rangeLabels[filters.amountRange] || filters.amountRange,
        value: filters.amountRange
      });
    }
    
    if (filters.timePeriod === 'custom' && (filters.dateFrom || filters.dateTo)) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-IN') : '';
      const toDate = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-IN') : '';
      
      if (fromDate && toDate) {
        newActiveFilters.push({
          type: 'dateRange',
          label: `${fromDate} - ${toDate}`,
          value: 'custom-range'
        });
      } else if (fromDate) {
        newActiveFilters.push({
          type: 'dateFrom',
          label: `From ${fromDate}`,
          value: 'from-date'
        });
      } else if (toDate) {
        newActiveFilters.push({
          type: 'dateTo',
          label: `Until ${toDate}`,
          value: 'to-date'
        });
      }
    }
    
    setActiveFilters(newActiveFilters);
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.type === 'timePeriod' || filterToRemove.type === 'dateRange' || 
        filterToRemove.type === 'dateFrom' || filterToRemove.type === 'dateTo') {
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
    
    // Remove the filter from active filters
    const updatedFilters = activeFilters.filter(filter => 
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    );
    
    // Also remove related date filters if removing time period
    if (filterToRemove.type === 'timePeriod') {
      const filteredActiveFilters = updatedFilters.filter(filter => 
        !['dateRange', 'dateFrom', 'dateTo'].includes(filter.type)
      );
      setActiveFilters(filteredActiveFilters);
    } else {
      setActiveFilters(updatedFilters);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      timePeriod: '',
      type: '',
      amountRange: '',
      dateFrom: '',
      dateTo: ''
    });
    setActiveFilters([]);
  };

  const getFilteredLoans = () => {
    let filtered = [...financialData.loans];
    
    // Apply time period filter
    if (filters.timePeriod && filters.timePeriod !== '') {
      const now = new Date();
      let startDate, endDate;
      
      switch (filters.timePeriod) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = now;
          break;
        case 'last6Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          endDate = now;
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        case 'lastYear':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        case 'custom':
          if (filters.dateFrom) startDate = new Date(filters.dateFrom);
          if (filters.dateTo) endDate = new Date(filters.dateTo);
          break;
        default:
          break;
      }
      
      if (startDate || endDate) {
        filtered = filtered.filter(loan => {
          const loanDate = new Date(loan.startDate || loan.createdAt);
          const matchesStart = !startDate || loanDate >= startDate;
          const matchesEnd = !endDate || loanDate <= endDate;
          return matchesStart && matchesEnd;
        });
      }
    }
    
    // Apply type filter
    if (filters.type && filters.type !== '') {
      filtered = filtered.filter(loan => 
        loan.type && loan.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    
    // Apply amount range filter
    if (filters.amountRange && filters.amountRange !== '') {
      filtered = filtered.filter(loan => {
        const amount = parseFloat(loan.principal) || 0;
        switch (filters.amountRange) {
          case '0-10000':
            return amount >= 0 && amount <= 10000;
          case '10000-50000':
            return amount > 10000 && amount <= 50000;
          case '50000-100000':
            return amount > 50000 && amount <= 100000;
          case '100000-500000':
            return amount > 100000 && amount <= 500000;
          case '500000-1000000':
            return amount > 500000 && amount <= 1000000;
          case '1000000+':
            return amount > 1000000;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  };

  // Handler functions for show more/less functionality
  const handleLoadAllLoans = async () => {
    if (showAllLoans) {
      setShowAllLoans(false);
      return;
    }
    
    setIsLoadingMore(true);
    try {
      // Data is already loaded in financialData, just toggle view
      setShowAllLoans(true);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handler functions for edit/delete functionality
  const handleDeleteLoan = async (loanId) => {
    setIsDeleting(true);
    try {
      await ApiService.deleteLoan(loanId);
      
      // Show success notification
      showSuccess('Loan deleted successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting loan:', error);
      showError('Failed to delete loan. Please try again.', 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setEditFormData({
      lender: loan.lender || '',
      type: loan.type || '',
      description: loan.description || '',
      principal: loan.principal?.toString() || '',
      interestRate: loan.interestRate?.toString() || '',
      startDate: loan.startDate ? loan.startDate.split('T')[0] : '',
      endDate: loan.endDate ? loan.endDate.split('T')[0] : ''
    });
  };

  const handleUpdateLoan = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updateData = {
        lender: editFormData.lender,
        type: editFormData.type,
        description: editFormData.description,
        principal: parseFloat(editFormData.principal),
        interestRate: parseFloat(editFormData.interestRate),
        startDate: editFormData.startDate,
        endDate: editFormData.endDate || null
      };

      await ApiService.updateLoan(editingLoan.id, updateData);
      
      // Show success notification
      showSuccess('Loan updated successfully!', 3000);
      
      // Refresh financial data
      await fetchFinancialSummary();
      setEditingLoan(null);
    } catch (error) {
      console.error('Error updating loan:', error);
      showError('Failed to update loan. Please try again.', 5000);
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

  // Get filtered loans sorted by date (newest first)
  const filteredLoans = getFilteredLoans();
  const sortedLoans = filteredLoans
    .sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));
  
  // Display logic based on showAllLoans state
  const displayedLoans = showAllLoans ? sortedLoans : sortedLoans.slice(0, 5);
  const hasMoreLoans = sortedLoans.length > 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Loan Management" 
        subtitle="Track and manage your loans and debts"
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
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {formatCurrency(calculateTotalLoanPrincipal())}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Total Principal Debt from {financialData.loans.length} loans</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Sum of all loan principal amounts</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/loans/add')}
                  className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm sm:text-base">Add Loan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loan Analytics - Only show if there are loans */}
          {financialData.loans && financialData.loans.length > 0 && (
            <div className="mt-8 mb-8">
              <div className="w-full">
                <LoanOverviewChart loans={financialData.loans} />
              </div>
            </div>
          )}

          {/* Recent Loans */}
          <div className="bg-white shadow-lg rounded-lg sm:rounded-xl">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  {showAllLoans ? 'All Loan Records' : 'Recent Loans'}
                  {(activeFilters.length > 0 || showAllLoans) && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({sortedLoans.length} {activeFilters.length > 0 ? 'filtered' : 'total'})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm text-yellow-600 hover:text-yellow-500 font-medium border border-yellow-200 rounded-md hover:bg-yellow-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                  {activeFilters.length > 0 && (
                    <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {activeFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="px-4 sm:px-6 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">Filters:</span>
                  {activeFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                    >
                      {filter.label}
                      <button
                        onClick={() => removeFilter(filter)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-600 hover:bg-yellow-200 hover:text-yellow-800 focus:outline-none focus:bg-yellow-200 focus:text-yellow-800"
                      >
                        <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {activeFilters.length > 1 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium ml-2 px-2 py-1 rounded hover:bg-gray-200 transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {financialData.isLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading loan data...</p>
                </div>
              ) : displayedLoans.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {displayedLoans.map((loan, index) => (
                    <div key={loan.id || `loan-${index}`} className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-yellow-200 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex flex-col">
                        {/* Main Content Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                          {/* Enhanced Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Enhanced Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                              <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {loan.lender || loan.description || 'Loan'}
                              </h4>
                              {loan.type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 self-start sm:self-auto">
                                  🏦 {loan.type}
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            {loan.description && loan.lender && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                📝 {loan.description}
                              </p>
                            )}
                            
                            {/* Interest Rate */}
                            {loan.interestRate && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                📊 {loan.interestRate}% interest rate
                              </p>
                            )}
                            
                            {/* EMI Information */}
                            {loan.emi && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                💰 Monthly EMI: {formatCurrency(loan.emi)}
                              </p>
                            )}
                            
                            {/* Date and Additional Info */}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">From {formatDate(loan.startDate || loan.createdAt)}</span>
                              </div>
                              {loan.endDate && (
                                <span className="truncate">to {formatDate(loan.endDate)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                          {/* Enhanced Amount Display */}
                          <div className="flex-shrink-0 text-right space-y-1">
                            <div className="bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm border border-yellow-200">
                              <div className="text-right">
                                <div className="text-xs text-gray-500 font-medium">Principal</div>
                                <span className="text-sm sm:text-base lg:text-xl font-bold text-yellow-600 whitespace-nowrap">
                                  {formatCurrency(loan.principal || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-yellow-200">
                        <button
                          onClick={() => handleEditLoan(loan)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(loan.id)}
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
                  {hasMoreLoans && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <button
                        onClick={handleLoadAllLoans}
                        disabled={isLoadingMore}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors duration-200"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading...
                          </>
                        ) : showAllLoans ? (
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
                            Show All ({filteredLoans.length} records)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 text-base sm:text-lg">No loan records found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Start by adding your first loan</p>
                  <button
                    onClick={() => navigate('/loans/add')}
                    className="mt-3 sm:mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                  >
                    Add Your First Loan
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Loan</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this loan? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteLoan(deleteConfirmId)}
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

      {/* Edit Loan Modal */}
      {editingLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">Edit Loan Record</h3>
                </div>
                <button
                  onClick={() => setEditingLoan(null)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateLoan} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lender Name *</label>
                  <input
                    type="text"
                    name="lender"
                    value={editFormData.lender}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., HDFC Bank, SBI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type *</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="Personal Loan">👤 Personal Loan</option>
                    <option value="Home Loan">🏠 Home Loan</option>
                    <option value="Car Loan">🚗 Car Loan</option>
                    <option value="Education Loan">🎓 Education Loan</option>
                    <option value="Business Loan">💼 Business Loan</option>
                    <option value="Credit Card">💳 Credit Card</option>
                    <option value="Other">📋 Other</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Additional details about this loan..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount (₹) *</label>
                  <input
                    type="number"
                    name="principal"
                    value={editFormData.principal}
                    onChange={handleEditFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%) *</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={editFormData.interestRate}
                    onChange={handleEditFormChange}
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editFormData.startDate}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={editFormData.endDate}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Loan'
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
              <h3 className="text-lg font-semibold text-gray-900">Filter Loans</h3>
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

              {/* Loan Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount Range</label>
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

export default Loans;