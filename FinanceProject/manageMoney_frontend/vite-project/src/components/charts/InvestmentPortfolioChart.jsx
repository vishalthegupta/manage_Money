import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const InvestmentPortfolioChart = ({ investments = [] }) => {
  // Group investments by type
  const typeTotals = investments.reduce((acc, investment) => {
    const type = investment.type || 'Other';
    acc[type] = (acc[type] || 0) + (parseFloat(investment.amount) || 0);
    return acc;
  }, {});

  // Convert to arrays for Chart.js
  const types = Object.keys(typeTotals);
  const amounts = Object.values(typeTotals);

  // Diverse color palette for different investment types
  const colors = [
    '#3B82F6', // Blue - Stocks
    '#10B981', // Emerald - Mutual Funds
    '#F59E0B', // Amber - Gold/Commodities
    '#8B5CF6', // Purple - Cryptocurrency
    '#EF4444', // Red - Real Estate
    '#06B6D4', // Cyan - Fixed Deposits
    '#84CC16', // Lime - Bonds
    '#EC4899', // Pink - SIP/Recurring
    '#F97316', // Orange - Alternative Investments
    '#6366F1', // Indigo - Index Funds
  ];

  if (types.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-gray-500 text-sm">No investment data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: types,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, types.length),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Makes it a donut chart
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
        borderRadius: 6,
      },
    },
  };

  const totalInvestments = amounts.reduce((sum, amount) => sum + amount, 0);
  const topInvestmentType = types[amounts.indexOf(Math.max(...amounts))];

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-2 sm:mb-0">Investment Portfolio Distribution</h3>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500">Largest Holding</div>
          <div className="text-sm font-medium text-blue-600 truncate max-w-full sm:max-w-32">
            {topInvestmentType}
          </div>
        </div>
      </div>
      <div className="w-full h-48 sm:h-64 lg:h-72 relative">
        <Doughnut data={data} options={options} />
        {/* Center text showing total investments */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs text-gray-500">Total Portfolio</div>
            <div className="text-lg font-semibold text-blue-600">
              ₹{totalInvestments.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPortfolioChart;