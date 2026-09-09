import React from 'react';

const PageContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = true,
  ...props 
}) => {
  const maxWidths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className={`${maxWidths[maxWidth]} mx-auto ${padding ? 'px-4 sm:px-6 lg:px-8' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
