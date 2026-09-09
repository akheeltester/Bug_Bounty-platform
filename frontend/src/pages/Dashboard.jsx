import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageContainer, Card, Button } from '../components/ui';
import { SearchIcon, ShieldIcon, QueueIcon, LeaderboardIcon } from '../components/ui/Icons';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { to: '/', label: 'Browse Programs', icon: <SearchIcon className="w-8 h-8" />, description: 'Find active bug bounty programs' },
    { to: '/submit', label: 'Submit Vulnerability', icon: <ShieldIcon className="w-8 h-8" />, description: 'Report a new security finding' },
    { to: '/my-submissions', label: 'My Submissions', icon: <QueueIcon className="w-8 h-8" />, description: 'Track your vulnerability reports' },
    { to: '/leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon className="w-8 h-8" />, description: 'View top bug hunters' },
  ];

  return (
    <PageContainer className="py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
            <p className="text-gray-600 mt-1">Ready to hunt for vulnerabilities?</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-cyber-dark to-cyber-darker text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Total Earnings</p>
                <p className="text-4xl font-bold text-cyber-green">
                  ${(user.total_earnings || user.points || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-16 h-16 bg-cyber-green/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Submissions</p>
                <p className="text-4xl font-bold">{user.submissions || 0}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">Points</p>
                <p className="text-4xl font-bold">{user.points || 0}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-cyber-blue hover:shadow-card-hover transition-all duration-200 group"
              >
                <div className="text-cyber-blue mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-cyber-blue transition-colors mb-1">
                  {item.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;