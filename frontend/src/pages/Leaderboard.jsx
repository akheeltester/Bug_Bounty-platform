import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { GoldMedal, SilverMedal, BronzeMedal } from '../components/ui/Icons';

const Leaderboard = () => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // 1. Fetch Top 50 Users
        const lbResponse = await api.get('/leaderboard', { params: { limit: 50 } });
        setLeaderboard(lbResponse.data);

        // 2. If logged in, fetch personal rank
        if (isAuthenticated) {
          const rankResponse = await api.get('/leaderboard/me');
          setUserRank(rankResponse.data);
        }
      } catch (err) {
        setError('Failed to load standings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [isAuthenticated]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green/10 rounded-full mb-4">
          <svg className="w-5 h-5 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-sm font-semibold text-cyber-green">Top Bug Hunters</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Global Leaderboard</h1>
        <p className="text-lg text-gray-600">The top bug hunters ranked by total earnings.</p>
      </div>

      {/* Personal Rank Highlight */}
      {isAuthenticated && userRank && (
        <Card className="mb-8 bg-gradient-to-r from-cyber-dark to-cyber-darker text-white border-none shadow-2xl">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyber-green/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Your Current Rank</p>
                <p className="text-4xl font-bold text-cyber-green">#{userRank.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">Total Earnings</p>
              <p className="text-4xl font-bold text-cyber-green">${(userRank.total_earnings || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}

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
                <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {leaderboard.map((player, index) => {
                const isMe = currentUser && player.username === currentUser.username;
                const isTop3 = index < 3;
                return (
                  <tr 
                    key={player.rank}
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-blue-50 border-l-4 border-cyber-blue' 
                        : isTop3 
                          ? 'bg-gradient-to-r from-yellow-50 to-transparent' 
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {player.rank === 1 && <GoldMedal className="w-8 h-8" />}
                        {player.rank === 2 && <SilverMedal className="w-8 h-8" />}
                        {player.rank === 3 && <BronzeMedal className="w-8 h-8" />}
                        {!isTop3 && (
                          <span className="text-lg font-bold text-gray-700">
                            {player.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold text-base ${isMe ? 'text-cyber-blue' : 'text-gray-900'}`}>
                          {player.username}
                        </span>
                        {isMe && (
                          <Badge variant="primary" size="sm">
                            You
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-cyber-green">
                        ${(player.total_earnings || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg">No rankings available yet. Be the first to submit!</p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Leaderboard;