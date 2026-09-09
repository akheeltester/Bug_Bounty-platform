import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-cyber-dark to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyber-green/5 to-cyber-blue/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-green/30 rounded-2xl blur-xl"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyber-green to-green-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                <svg className="w-12 h-12 text-cyber-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-base">{subtitle}</p>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
          {children}
        </div>

        {/* Footer text */}
        <div className="text-center text-xs text-gray-500">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;