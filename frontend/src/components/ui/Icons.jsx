import React from 'react';

// Queue/Reports icon (from queue-up-wait-line-up-svgrepo-com.svg)
export const QueueIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 128 128" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="104.1" cy="18.5" r="8.9" />
    <path d="M115,44.6c0-7.5-5.5-13.6-12.5-14.8c0,0-0.9-0.1-1.1-0.1c-2.8,0-5,2.2-5,5c0,0.1,0,33.4,0,33.4c0,2.1,1.8,3.9,3.9,3.9c2.1,0,3.9-1.8,3.9-3.9V43.1c0-0.7,0.4-1.1,1.1-1.1c0.7,0,1.1,0.4,1.1,1.1v25.1c0,1.4-0.6,2.8-1.3,3.9c-1.1,1.3-2.8,2.2-4.8,2.2c-0.6,0-1.1-0.1-1.7-0.2v37c0,3.1,2.5,5.6,5.6,5.6c3.1,0,5.6-2.5,5.6-5.6V70c1.4-1.1,2.6-2.8,3-4.6c1.4-6.1,2.2-12.6,2.2-19.2C115.1,45.9,115,44.7,115,44.6z" />
    <circle cx="61.4" cy="18.5" r="8.9" />
    <path d="M72.2,44.6c0-7.5-5.5-13.6-12.5-14.8c0,0-0.9-0.1-1.1-0.1c-2.8,0-5,2.2-5,5c0,0.1,0,33.4,0,33.4c0,2.1,1.8,3.9,3.9,3.9c2.1,0,3.9-1.8,3.9-3.9V43.1c0-0.7,0.4-1.1,1.1-1.1c0.7,0,1.1,0.4,1.1,1.1v25.1c0,1.4-0.6,2.8-1.3,3.9c-1.1,1.3-2.8,2.2-4.8,2.2c-0.6,0-1.1-0.1-1.7-0.2v37c0,3.1,2.5,5.6,5.6,5.6c3.1,0,5.6-2.5,5.6-5.6V70c1.4-1.1,2.6-2.8,3-4.6c1.4-6.1,2.2-12.6,2.2-19.2C72.3,45.9,72.2,44.7,72.2,44.6z" />
    <circle cx="18.6" cy="18.5" r="8.9" />
    <path d="M29.4,44.6c0-7.5-5.5-13.6-12.5-14.8c0,0-0.9-0.1-1.1-0.1c-2.8,0-5,2.2-5,5c0,0.1,0,33.4,0,33.4c0,2.1,1.8,3.9,3.9,3.9c2.1,0,3.9-1.8,3.9-3.9V43.1c0-0.7,0.4-1.1,1.1-1.1c0.7,0,1.1,0.4,1.1,1.1v25.1c0,1.4-0.6,2.8-1.3,3.9c-1.1,1.3-2.8,2.2-4.8,2.2c-0.6,0-1.1-0.1-1.7-0.2v37c0,3.1,2.5,5.6,5.6,5.6c3.1,0,5.6-2.5,5.6-5.6V70c1.4-1.1,2.6-2.8,3-4.6c1.4-6.1,2.2-12.6,2.2-19.2C29.5,45.9,29.4,44.7,29.4,44.6z" />
  </svg>
);

// Target/Programs icon (from target-svgrepo-com.svg)
export const TargetIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// Leaderboard/Podium icon (from leaderboard-podium-svgrepo-com.svg)
export const LeaderboardIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21,13H16V10a1,1,0,0,0-1-1H9a1,1,0,0,0-1,1v5H3a1,1,0,0,0-1,1v5a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V14A1,1,0,0,0,21,13Z" />
    <path d="M12.93,6.85a1,1,0,0,1-.47-.11L12,6.5l-.46.24a1,1,0,0,1-1.45-1.06l.09-.51L9.8,4.81a1,1,0,0,1,.56-1.71L10.87,3l.23-.47a1,1,0,0,1,1.8,0l.23.47.51.07a1,1,0,0,1,.56,1.71l-.38.36.09.51a1,1,0,0,1-.39,1A1,1,0,0,1,12.93,6.85Z" fill="#2CA9BC" />
  </svg>
);

// Dollar/Reward icon (from dollar-svgrepo-com.svg)
export const DollarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9 9.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5S14.33 11 13.5 11h-3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5" strokeLinecap="round" />
  </svg>
);

// Search icon
export const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

// Shield icon
export const ShieldIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Bell icon
export const BellIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Chart/Bar icon
export const ChartIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// Checkmark circle icon
export const CheckCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// X circle icon
export const XCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Question circle icon
export const QuestionCircleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Chat bubble icon
export const ChatIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// User icon
export const UserIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Severity dot indicators
export const SeverityDot = ({ severity, className = 'w-3 h-3' }) => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return (
    <svg className={className} viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="6" fill={colors[severity] || '#6b7280'} />
    </svg>
  );
};

// Medal icons for rankings
export const GoldMedal = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="10" r="8" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
    <path d="M12 6l1.5 3 3.5.5-2.5 2.4.6 3.5L12 13.5l-3.1 1.9.6-3.5L7 9.5l3.5-.5z" fill="#B8860B" />
    <path d="M9 18l-1 6h8l-1-6" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5" />
  </svg>
);

export const SilverMedal = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="10" r="8" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
    <path d="M12 6l1.5 3 3.5.5-2.5 2.4.6 3.5L12 13.5l-3.1 1.9.6-3.5L7 9.5l3.5-.5z" fill="#808080" />
    <path d="M9 18l-1 6h8l-1-6" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5" />
  </svg>
);

export const BronzeMedal = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="10" r="8" fill="#CD7F32" stroke="#8B4513" strokeWidth="1" />
    <path d="M12 6l1.5 3 3.5.5-2.5 2.4.6 3.5L12 13.5l-3.1 1.9.6-3.5L7 9.5l3.5-.5z" fill="#8B4513" />
    <path d="M9 18l-1 6h8l-1-6" fill="#CD7F32" stroke="#8B4513" strokeWidth="0.5" />
  </svg>
);
