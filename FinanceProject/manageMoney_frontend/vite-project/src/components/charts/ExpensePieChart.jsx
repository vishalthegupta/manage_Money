import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ expenses = [] }) => {
  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + (parseFloat(expense.amount) || 0);
    return acc;
  }, {});

  // Convert to arrays for Chart.js
  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  // Vibrant, diverse color palette for expense categories
  const colors = [
    '#EF4444', // Red - Food & Dining
    '#F97316', // Orange - Transportation
    '#EAB308', // Yellow - Shopping
    '#22C55E', // Green - Bills & Utilities
    '#3B82F6', // Blue - Healthcare
    '#8B5CF6', // Purple - Entertainment
    '#EC4899', // Pink - Education
    '#06B6D4', // Cyan - Travel
    '#84CC16', // Lime - Personal Care
    '#F59E0B', // Amber - Other
  ];

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">No expense data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = amounts.reduce((sum, amount) => sum + amount, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    elements: {
      arc: {
        borderRadius: 4,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-2 sm:mb-0">Expense Breakdown by Category</h3>
        <div className="text-sm text-gray-500">
          Total: ₹{amounts.reduce((sum, amount) => sum + amount, 0).toLocaleString('en-IN')}
        </div>
      </div>
      <div className="w-full h-48 sm:h-64 lg:h-72">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default ExpensePieChart;