import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LoanOverviewChart = ({ loans = [] }) => {
  // Group loans by type
  const loanTypeTotals = loans.reduce((acc, loan) => {
    const type = loan.type || 'Other';
    acc[type] = (acc[type] || 0) + (parseFloat(loan.principal) || 0);
    return acc;
  }, {});

  // Convert to arrays for Chart.js
  const loanTypes = Object.keys(loanTypeTotals);
  const principals = Object.values(loanTypeTotals);

  // Calculate EMI totals by type
  const emiTotals = loans.reduce((acc, loan) => {
    const type = loan.type || 'Other';
    const emi = parseFloat(loan.emi) || 0;
    acc[type] = (acc[type] || 0) + emi;
    return acc;
  }, {});

  const emis = loanTypes.map(type => emiTotals[type] || 0);

  if (loanTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-sm">No loan data available</p>
        </div>
      </div>
    );
  }

  // Diverse color palettes for loan types
  const principalColors = [
    '#F59E0B', // Amber - Home Loan
    '#EF4444', // Red - Personal Loan  
    '#3B82F6', // Blue - Car Loan
    '#10B981', // Emerald - Education Loan
    '#8B5CF6', // Purple - Business Loan
    '#EC4899', // Pink - Credit Card
    '#06B6D4', // Cyan - Other Loans
    '#84CC16', // Lime - Additional
  ];

  const emiColors = [
    '#D97706', // Darker Amber
    '#DC2626', // Darker Red
    '#2563EB', // Darker Blue 
    '#059669', // Darker Emerald
    '#7C3AED', // Darker Purple
    '#DB2777', // Darker Pink
    '#0891B2', // Darker Cyan
    '#65A30D', // Darker Lime
  ];

  const data = {
    labels: loanTypes,
    datasets: [
      {
        label: 'Principal Amount',
        data: principals,
        backgroundColor: principalColors.slice(0, loanTypes.length),
        borderColor: principalColors.slice(0, loanTypes.length),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Monthly EMI',
        data: emis,
        backgroundColor: emiColors.slice(0, loanTypes.length),
        borderColor: emiColors.slice(0, loanTypes.length),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
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
          maxRotation: 45,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
      },
    },
  };

  const totalPrincipal = principals.reduce((sum, amount) => sum + amount, 0);
  const totalEMI = emis.reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-2 sm:mb-0">Loan Portfolio Analysis</h3>
        <div className="text-left sm:text-right">
          <div className="text-sm text-gray-500">Total Monthly EMI</div>
          <div className="text-sm font-medium text-orange-600">
            ₹{totalEMI.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="w-full h-48 sm:h-64 lg:h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default LoanOverviewChart;