import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import PortfolioChart from '../components/charts/PortfolioChart';

const Dashboard = () => {
  const { 
    userInfo, 
    financialData, 
    fetchFinancialSummary, 
    isFinancialDataStale 
  } = useAuth();
  const navigate = useNavigate();

  // Filter state management for recent transactions
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState({
    timePeriod: '',
    type: '',
    amountRange: '',
    dateFrom: '',
    dateTo: ''
  });
  const [activeTransactionFilters, setActiveTransactionFilters] = useState([]);

  // Fetch financial data on component mount
  useEffect(() => {
    const loadFinancialData = async () => {
      if (userInfo?.id) {
        // Only fetch if data is stale or doesn't exist
        if (isFinancialDataStale()) {
          console.log('Loading financial data...');
          await fetchFinancialSummary();
        } else {
          console.log('Using cached financial data');
        }
      }
    };

    loadFinancialData();
  }, [userInfo?.id, fetchFinancialSummary, isFinancialDataStale]);

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

  // Calculate current month's income
  const calculateCurrentMonthIncome = () => {
    if (!financialData.incomes || financialData.incomes.length === 0) {
      return 0;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return financialData.incomes.reduce((total, income) => {
      const incomeDate = new Date(income.date || income.createdAt);
      if (incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear) {
        return total + (parseFloat(income.amount) || 0);
      }
      return total;
    }, 0);
  };

  // Calculate current month's expenses
  const calculateCurrentMonthExpenses = () => {
    if (!financialData.expenses || financialData.expenses.length === 0) {
      return 0;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return financialData.expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        return total + (parseFloat(expense.amount) || 0);
      }
      return total;
    }, 0);
  };

  // Filter logic functions for recent transactions
  const applyTransactionFilters = () => {
    const newActiveFilters = [];
    
    if (transactionFilters.timePeriod) {
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
        label: periodLabels[transactionFilters.timePeriod] || transactionFilters.timePeriod,
        value: transactionFilters.timePeriod
      });
    }
    
    if (transactionFilters.type) {
      const typeLabels = {
        income: 'Income',
        expense: 'Expense',
        investment: 'Investment',
        loan: 'Loan'
      };
      newActiveFilters.push({
        type: 'type',
        label: typeLabels[transactionFilters.type] || transactionFilters.type,
        value: transactionFilters.type
      });
    }
    
    if (transactionFilters.amountRange) {
      const rangeLabels = {
        '0-1000': '₹0 - ₹1K',
        '1000-5000': '₹1K - ₹5K',
        '5000-10000': '₹5K - ₹10K',
        '10000-50000': '₹10K - ₹50K',
        '50000-100000': '₹50K - ₹1L',
        '100000+': '₹1L+'
      };
      newActiveFilters.push({
        type: 'amountRange',
        label: rangeLabels[transactionFilters.amountRange] || transactionFilters.amountRange,
        value: transactionFilters.amountRange
      });
    }
    
    if (transactionFilters.timePeriod === 'custom' && (transactionFilters.dateFrom || transactionFilters.dateTo)) {
      const fromDate = transactionFilters.dateFrom ? new Date(transactionFilters.dateFrom).toLocaleDateString('en-IN') : '';
      const toDate = transactionFilters.dateTo ? new Date(transactionFilters.dateTo).toLocaleDateString('en-IN') : '';
      
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
    
    setActiveTransactionFilters(newActiveFilters);
  };

  const removeTransactionFilter = (filterToRemove) => {
    if (filterToRemove.type === 'timePeriod' || filterToRemove.type === 'dateRange' || 
        filterToRemove.type === 'dateFrom' || filterToRemove.type === 'dateTo') {
      setTransactionFilters(prev => ({
        ...prev,
        timePeriod: '',
        dateFrom: '',
        dateTo: ''
      }));
    } else {
      setTransactionFilters(prev => ({
        ...prev,
        [filterToRemove.type]: ''
      }));
    }
    
    const updatedFilters = activeTransactionFilters.filter(filter => 
      !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
    );
    
    if (filterToRemove.type === 'timePeriod') {
      const filteredActiveFilters = updatedFilters.filter(filter => 
        !['dateRange', 'dateFrom', 'dateTo'].includes(filter.type)
      );
      setActiveTransactionFilters(filteredActiveFilters);
    } else {
      setActiveTransactionFilters(updatedFilters);
    }
  };

  const clearAllTransactionFilters = () => {
    setTransactionFilters({
      timePeriod: '',
      type: '',
      amountRange: '',
      dateFrom: '',
      dateTo: ''
    });
    setActiveTransactionFilters([]);
  };

  // Helper function to get all recent transactions sorted by date (newest first)
  const getRecentTransactions = () => {
    const allTransactions = [];

    // Add incomes
    financialData.incomes.forEach(income => {
      allTransactions.push({
        ...income,
        type: 'income',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      });
    });

    // Add expenses
    financialData.expenses.forEach(expense => {
      allTransactions.push({
        ...expense,
        type: 'expense',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
      });
    });

    // Add investments
    financialData.investments.forEach(investment => {
      allTransactions.push({
        ...investment,
        type: 'investment',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      });
    });

    // Add loans
    financialData.loans.forEach(loan => {
      allTransactions.push({
        ...loan,
        type: 'loan',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
      });
    });

    // Apply filters
    let filteredTransactions = [...allTransactions];
    
    // Apply time period filter
    if (transactionFilters.timePeriod && transactionFilters.timePeriod !== '') {
      const now = new Date();
      let startDate, endDate;
      
      switch (transactionFilters.timePeriod) {
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
          if (transactionFilters.dateFrom) startDate = new Date(transactionFilters.dateFrom);
          if (transactionFilters.dateTo) endDate = new Date(transactionFilters.dateTo);
          break;
        default:
          break;
      }
      
      if (startDate || endDate) {
        filteredTransactions = filteredTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date || transaction.startDate);
          const matchesStart = !startDate || transactionDate >= startDate;
          const matchesEnd = !endDate || transactionDate <= endDate;
          return matchesStart && matchesEnd;
        });
      }
    }
    
    // Apply type filter
    if (transactionFilters.type && transactionFilters.type !== '') {
      filteredTransactions = filteredTransactions.filter(transaction => 
        transaction.type === transactionFilters.type
      );
    }
    
    // Apply amount range filter
    if (transactionFilters.amountRange && transactionFilters.amountRange !== '') {
      filteredTransactions = filteredTransactions.filter(transaction => {
        const amount = parseFloat(transaction.amount || transaction.principal) || 0;
        switch (transactionFilters.amountRange) {
          case '0-1000':
            return amount >= 0 && amount <= 1000;
          case '1000-5000':
            return amount > 1000 && amount <= 5000;
          case '5000-10000':
            return amount > 5000 && amount <= 10000;
          case '10000-50000':
            return amount > 10000 && amount <= 50000;
          case '50000-100000':
            return amount > 50000 && amount <= 100000;
          case '100000+':
            return amount > 100000;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first) and return first 10
    return filteredTransactions
      .sort((a, b) => new Date(b.date || b.startDate) - new Date(a.date || a.startDate))
      .slice(0, 10);
  };

  // Helper function to format transaction display
  const getTransactionDisplay = (transaction) => {
    switch (transaction.type) {
      case 'income':
        return {
          title: transaction.source || 'Income',
          subtitle: transaction.category,
          amount: `+₹${transaction.amount?.toLocaleString('en-IN')}`,
          date: transaction.date
        };
      case 'expense':
        return {
          title: transaction.category || 'Expense',
          subtitle: transaction.description,
          amount: `-₹${transaction.amount?.toLocaleString('en-IN')}`,
          date: transaction.date
        };
      case 'investment':
        return {
          title: transaction.type || 'Investment',
          subtitle: transaction.institution,
          amount: `₹${transaction.amount?.toLocaleString('en-IN')}`,
          date: transaction.date
        };
      case 'loan':
        return {
          title: `${transaction.type} Loan`,
          subtitle: transaction.lender,
          amount: `₹${transaction.principal?.toLocaleString('en-IN')}`,
          date: transaction.startDate
        };
      default:
        return {
          title: 'Transaction',
          subtitle: '',
          amount: '₹0',
          date: new Date().toISOString().split('T')[0]
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Finance Dashboard" 
        subtitle={userInfo ? `Welcome back, ${userInfo.fullName}!` : "Manage your finances"}
        showBackButton={false}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Income Card */}
            <div 
              onClick={() => navigate('/income')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">This Month's Income</h3>
                </div>
                <div className="mt-2 flex items-baseline">
                  {financialData.isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    <span className="text-2xl font-semibold text-green-600">
                      ₹{calculateCurrentMonthIncome().toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {financialData.incomes.length} total income sources
                </p>
              </div>
            </div>

            {/* Expenses Card */}
            <div 
              onClick={() => navigate('/expenses')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">This Month's Expenses</h3>
                </div>
                <div className="mt-2 flex items-baseline">
                  {financialData.isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    <span className="text-2xl font-semibold text-red-600">
                      ₹{calculateCurrentMonthExpenses().toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {financialData.expenses.length} total expense entries
                </p>
              </div>
            </div>

            {/* Investments Card */}
            <div 
              onClick={() => navigate('/investments')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Investments</h3>
                </div>
                <div className="mt-2 flex items-baseline">
                  {financialData.isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    <span className="text-2xl font-semibold text-blue-600">
                      ₹{financialData.totalInvestments.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {financialData.investments.length} investments
                </p>
              </div>
            </div>

            {/* Loans Card */}
            <div 
              onClick={() => navigate('/loans')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Total Debt</h3>
                </div>
                <div className="mt-2 flex items-baseline">
                  {financialData.isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    <span className="text-2xl font-semibold text-yellow-600">
                      ₹{calculateTotalLoanPrincipal().toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {financialData.loans.length} active loans
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Total principal amount
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Financial Overview
                </h3>
                <button
                  onClick={fetchFinancialSummary}
                  disabled={financialData.isLoading}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                >
                  {financialData.isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              {financialData.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading financial data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Month Cash Flow */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">This Month's Cash Flow</h4>
                    <div className="text-3xl font-bold">
                      <span className={`${(calculateCurrentMonthIncome() - calculateCurrentMonthExpenses()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(calculateCurrentMonthIncome() - calculateCurrentMonthExpenses()).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Income - Expenses
                    </p>
                  </div>

                  {/* Net Worth Calculation */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Overall Net Worth</h4>
                    <div className="text-2xl font-bold">
                      <span className={`${(financialData.totalIncome + financialData.totalInvestments - financialData.totalExpenses - calculateTotalLoanPrincipal()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(financialData.totalIncome + financialData.totalInvestments - financialData.totalExpenses - calculateTotalLoanPrincipal()).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Total assets - Total liabilities
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Total Investments
                      </h4>
                      <p className="text-xl font-semibold text-blue-600">
                        ₹{financialData.totalInvestments.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Total Debt
                      </h4>
                      <p className="text-xl font-semibold text-yellow-600">
                        ₹{calculateTotalLoanPrincipal().toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Monthly Savings Rate
                      </h4>
                      <p className="text-xl font-semibold text-purple-600">
                        {calculateCurrentMonthIncome() > 0 
                          ? `${(((calculateCurrentMonthIncome() - calculateCurrentMonthExpenses()) / calculateCurrentMonthIncome()) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>

                  {financialData.lastUpdated && (
                    <p className="text-xs text-gray-400 text-center">
                      Last updated: {financialData.lastUpdated.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Charts - Only show if there's data */}
          {(financialData.incomes.length > 0 || financialData.expenses.length > 0 || financialData.investments.length > 0 || financialData.loans.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <MonthlyTrendChart 
                incomes={financialData.incomes} 
                expenses={financialData.expenses} 
              />
              <PortfolioChart 
                totalIncome={financialData.totalIncome}
                totalExpenses={financialData.totalExpenses}
                totalInvestments={financialData.totalInvestments}
                totalLoans={calculateTotalLoanPrincipal()}
              />
            </div>
          )}

          {/* Recent Transactions Section */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Transactions
                    {activeTransactionFilters.length > 0 && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({getRecentTransactions().length} filtered)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Latest 10 transactions across all categories
                  </p>
                </div>
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                  {activeTransactionFilters.length > 0 && (
                    <span className="ml-1 bg-indigo-100 text-indigo-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {activeTransactionFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Chips */}
            {activeTransactionFilters.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">Filters:</span>
                  {activeTransactionFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      {filter.label}
                      <button
                        onClick={() => removeTransactionFilter(filter)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 focus:outline-none focus:bg-indigo-200 focus:text-indigo-800"
                      >
                        <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  {activeTransactionFilters.length > 1 && (
                    <button
                      onClick={clearAllTransactionFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium ml-2 px-2 py-1 rounded hover:bg-gray-200 transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="px-6 py-4">
              {financialData.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading transactions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentTransactions().length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-500">No transactions found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start by adding some income, expenses, investments, or loans
                      </p>
                    </div>
                  ) : (
                    getRecentTransactions().map((transaction) => {
                      const display = getTransactionDisplay(transaction);
                      
                      // Dynamic gradient classes based on transaction type
                      const gradientClasses = {
                        income: 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 hover:border-green-200',
                        expense: 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-100 hover:border-red-200',
                        investment: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 hover:border-blue-200',
                        loan: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-100 hover:border-yellow-200'
                      };
                      
                      const iconGradients = {
                        income: 'bg-gradient-to-br from-green-500 to-green-600',
                        expense: 'bg-gradient-to-br from-red-500 to-red-600',
                        investment: 'bg-gradient-to-br from-blue-500 to-blue-600',
                        loan: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                      };

                      const borderColors = {
                        income: 'border-green-200',
                        expense: 'border-red-200',  
                        investment: 'border-blue-200',
                        loan: 'border-yellow-200'
                      };

                      return (
                        <div
                          key={`${transaction.type}-${transaction.id || index}`}
                          className={`${gradientClasses[transaction.type]} rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                              {/* Enhanced Icon */}
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconGradients[transaction.type]} rounded-lg flex items-center justify-center shadow-lg`}>
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={transaction.icon} />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Enhanced Content */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                    {display.title}
                                  </h4>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${transaction.bgColor} ${transaction.color.replace('text-', 'text-').replace('-600', '-800')} self-start sm:self-auto`}>
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </span>
                                </div>
                                
                                {/* Subtitle */}
                                {display.subtitle && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">
                                    📝 {display.subtitle}
                                  </p>
                                )}
                                
                                {/* Date */}
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{new Date(display.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Amount Display */}
                            <div className="flex-shrink-0 text-right">
                              <div className={`bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-sm border ${borderColors[transaction.type]}`}>
                                <span className={`text-sm sm:text-base font-bold ${transaction.color} whitespace-nowrap`}>
                                  {display.amount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Filter Modal for Recent Transactions */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
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
                  value={transactionFilters.timePeriod}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, timePeriod: e.target.value }))}
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
              {transactionFilters.timePeriod === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={transactionFilters.dateFrom}
                      onChange={(e) => setTransactionFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={transactionFilters.dateTo}
                      onChange={(e) => setTransactionFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={transactionFilters.type}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="investment">Investment</option>
                  <option value="loan">Loan</option>
                </select>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <select
                  value={transactionFilters.amountRange}
                  onChange={(e) => setTransactionFilters(prev => ({ ...prev, amountRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any Amount</option>
                  <option value="0-1000">₹0 - ₹1,000</option>
                  <option value="1000-5000">₹1,000 - ₹5,000</option>
                  <option value="5000-10000">₹5,000 - ₹10,000</option>
                  <option value="10000-50000">₹10,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                  <option value="100000+">₹1,00,000+</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setTransactionFilters({
                    timePeriod: '',
                    type: '',
                    amountRange: '',
                    dateFrom: '',
                    dateTo: ''
                  });
                  setActiveTransactionFilters([]);
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
                    applyTransactionFilters();
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

export default Dashboard;