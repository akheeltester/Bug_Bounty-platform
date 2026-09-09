import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'default',
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-card border border-gray-100';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <div 
      className={`${baseStyles} ${paddings[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
