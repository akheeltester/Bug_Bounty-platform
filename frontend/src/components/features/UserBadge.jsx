import React from 'react';
import Badge from '../ui/Badge';

const UserBadge = ({ username, points }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-cyber-green/10 text-cyber-green px-3 py-1.5 rounded-full text-sm font-medium">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      <span>{username}</span>
      {points !== undefined && (
        <Badge variant="warning" size="sm" className="font-bold">
          {points} pts
        </Badge>
      )}
    </div>
  );
};

export default UserBadge;
