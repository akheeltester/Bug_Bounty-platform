import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-cyber-blue text-white hover:bg-blue-600 focus:ring-cyber-blue btn-hover',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 btn-hover',
    success: 'bg-cyber-success text-white hover:bg-green-600 focus:ring-cyber-success btn-hover',
    danger: 'bg-cyber-danger text-white hover:bg-red-600 focus:ring-cyber-danger btn-hover',
    warning: 'bg-cyber-warning text-gray-900 hover:bg-yellow-500 focus:ring-cyber-warning btn-hover',
    info: 'bg-cyber-info text-white hover:bg-cyan-600 focus:ring-cyber-info btn-hover',
    outline: 'border-2 border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-white focus:ring-cyber-blue btn-hover',
    ghost: 'text-cyber-blue hover:bg-blue-50 focus:ring-cyber-blue',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
