import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { SeverityDot } from '../ui/Icons';

const ProgramCard = ({ program, className = '' }) => {
  const severityLevels = [
    { key: 'critical', label: 'Critical', severity: 'critical' },
    { key: 'high', label: 'High', severity: 'high' },
    { key: 'medium', label: 'Medium', severity: 'medium' },
    { key: 'low', label: 'Low', severity: 'low' },
  ];

  return (
    <Card hover padding="lg" className={className}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
            <p className="text-gray-600 leading-relaxed">{program.description}</p>
          </div>
          <Badge variant={program.is_active !== false ? 'success' : 'danger'} size="md">
            {program.is_active !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Reward Criteria */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-cyber-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">Reward Matrix</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {severityLevels.map(({ key, label, severity }) => (
              <div key={key} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                <SeverityDot severity={severity} className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-600">{label}</p>
                  <p className="text-sm font-bold text-gray-900">${program[`reward_${key}`] ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Target URL and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Target:</span>
            <a 
              href={program.access_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyber-blue hover:text-blue-700 font-medium transition-colors"
            >
              {program.access_url}
            </a>
          </div>
          <Link 
            to="/submit" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-blue text-white rounded-lg hover:bg-blue-600 font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Report Vulnerability
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ProgramCard;