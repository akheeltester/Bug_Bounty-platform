import React from 'react';

const StatCard = ({ 
  icon, 
  label, 
  value, 
  trend,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-card border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-cyber-blue/10 rounded-lg flex items-center justify-center text-cyber-blue">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
