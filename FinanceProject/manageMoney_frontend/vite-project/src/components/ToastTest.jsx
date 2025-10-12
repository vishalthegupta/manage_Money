import React from 'react';
import { useToast } from '../context/ToastContext';

const ToastTest = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const testToasts = () => {
    showSuccess('Registration successful! Welcome!');
    setTimeout(() => showError('Login failed. Invalid credentials.'), 1000);
    setTimeout(() => showWarning('Password must be at least 6 characters.'), 2000);
    setTimeout(() => showInfo('Processing your request...'), 3000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Toast Test Component</h2>
      <button 
        onClick={testToasts}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test All Toasts
      </button>
    </div>
  );
};

export default ToastTest;