import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const IncomeSourceChart = ({ incomes = [] }) => {
  // Group incomes by source/category
  const sourceTotals = incomes.reduce((acc, income) => {
    const source = income.source || income.category || 'Other';
    acc[source] = (acc[source] || 0) + (parseFloat(income.amount) || 0);
    return acc;
  }, {});

  // Convert to arrays for Chart.js
  const sources = Object.keys(sourceTotals);
  const amounts = Object.values(sourceTotals);

  // Diverse, vibrant color palette for income sources
  const colors = [
    '#22C55E', // Green - Salary/Primary
    '#3B82F6', // Blue - Secondary Income
    '#8B5CF6', // Purple - Freelance/Contract
    '#F59E0B', // Amber - Business/Investment Returns
    '#EF4444', // Red - Bonuses
    '#06B6D4', // Cyan - Rental Income
    '#EC4899', // Pink - Side Projects
    '#84CC16', // Lime - Other Sources
    '#F97316', // Orange - Commissions
    '#6366F1', // Indigo - Dividends
  ];

  if (sources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p className="text-gray-500 text-sm">No income data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: sources,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, sources.length),
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

  const totalIncome = amounts.reduce((sum, amount) => sum + amount, 0);
  const topSource = sources[amounts.indexOf(Math.max(...amounts))];

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-2 sm:mb-0">Income Sources Breakdown</h3>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500">
            Total: ₹{totalIncome.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="w-full h-48 sm:h-64 lg:h-72">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default IncomeSourceChart;