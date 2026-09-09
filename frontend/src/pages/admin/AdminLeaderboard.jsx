import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { QueueIcon, TargetIcon, GoldMedal, SilverMedal, BronzeMedal } from '../../components/ui/Icons';

const AdminLeaderboard = () => {
  const { isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/dashboard');
    }
    if (isAuthenticated && isAdmin) {
      api.get('/admin/leaderboard')
        .then(r => setPlayers(r.data))
        .catch(() => setError('Failed to load leaderboard.'))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  if (authLoading || loading) return <LoadingSpinner fullScreen />;

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Participant Leaderboard</h1>
            <p className="text-gray-600 mt-1">
              {players.length} registered participants ranked by total earnings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
              <QueueIcon className="w-4 h-4 mr-1.5" /> Reports Queue
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/programs')}>
              <TargetIcon className="w-4 h-4 mr-1.5" /> Programs
            </Button>
            <Button variant="danger" size="sm" onClick={() => { logout(); navigate('/login'); }}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Leaderboard Table */}
      <Card padding="none" className="overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cyber-darker text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Hacker</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {players.map((p, i) => (
                <tr 
                  key={p._id}
                  className={`transition-colors ${
                    i < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-transparent' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.rank === 1 && <GoldMedal className="w-8 h-8" />}
                      {p.rank === 2 && <SilverMedal className="w-8 h-8" />}
                      {p.rank === 3 && <BronzeMedal className="w-8 h-8" />}
                      {p.rank > 3 && (
                        <span className="text-lg font-bold text-gray-700">
                          #{p.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-base text-gray-900">
                      {p.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{p.email}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-lg text-cyber-green">
                      ${(p.total_earnings || p.points || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg text-gray-600">No participants yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default AdminLeaderboard;
