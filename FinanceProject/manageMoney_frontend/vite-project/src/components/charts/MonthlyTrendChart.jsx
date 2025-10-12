import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlyTrendChart = ({ incomes = [], expenses = [] }) => {
  // Get last 6 months
  const getLastSixMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    return months;
  };

  const months = getLastSixMonths();

  // Calculate monthly totals
  const monthlyIncomes = months.map(({ month, year }) => {
    return incomes
      .filter(income => {
        const incomeDate = new Date(income.date || income.createdAt);
        return incomeDate.getMonth() === month && incomeDate.getFullYear() === year;
      })
      .reduce((total, income) => total + (parseFloat(income.amount) || 0), 0);
  });

  const monthlyExpenses = months.map(({ month, year }) => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
      })
      .reduce((total, expense) => total + (parseFloat(expense.amount) || 0), 0);
  });

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyIncomes,
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#22C55E',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          },
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const hasData = monthlyIncomes.some(amount => amount > 0) || monthlyExpenses.some(amount => amount > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">No trend data available</p>
        </div>
      </div>
    );
  }

  const currentMonthIncome = monthlyIncomes[monthlyIncomes.length - 1] || 0;
  const currentMonthExpenses = monthlyExpenses[monthlyExpenses.length - 1] || 0;
  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="bg-white rounded-lg p-4 h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">This Month</div>
          <div className={`text-sm font-medium ${currentMonthSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currentMonthSavings >= 0 ? '+' : ''}₹{currentMonthSavings.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default MonthlyTrendChart;