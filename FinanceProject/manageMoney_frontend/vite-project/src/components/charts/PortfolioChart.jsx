import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioChart = ({ 
  totalIncome = 0, 
  totalExpenses = 0, 
  totalInvestments = 0, 
  totalLoans = 0 
}) => {
  // Use the actual values for better financial overview
  const income = totalIncome;
  const expenses = totalExpenses;
  const investments = totalInvestments;
  const debt = totalLoans;
  
  const netWorth = (income + investments) - (expenses + debt);

  // Only show meaningful data
  const hasData = income > 0 || expenses > 0 || investments > 0 || debt > 0;

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">No portfolio data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for chart - only include non-zero values
  const chartData = [];
  const chartLabels = [];
  const chartColors = [];

  if (income > 0) {
    chartData.push(income);
    chartLabels.push('Income');
    chartColors.push('#22C55E'); // Green for income
  }
  
  if (expenses > 0) {
    chartData.push(expenses);
    chartLabels.push('Expenses');
    chartColors.push('#EF4444'); // Red for expenses
  }
  
  if (investments > 0) {
    chartData.push(investments);
    chartLabels.push('Investments');
    chartColors.push('#3B82F6'); // Blue for investments
  }
  
  if (debt > 0) {
    chartData.push(debt);
    chartLabels.push('Debt');
    chartColors.push('#F59E0B'); // Amber/Orange for debt
  }

  const data = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: chartColors,
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
            const total = chartData.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
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

  return (
    <div className="bg-white rounded-lg p-4 h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Financial Overview</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Net Position</div>
          <div className={`text-sm font-medium ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{netWorth.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="h-64 relative">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default PortfolioChart;