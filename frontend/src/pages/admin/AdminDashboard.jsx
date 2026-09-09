import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Select from '../../components/ui/Select';
import { TargetIcon, LeaderboardIcon, BellIcon, ChartIcon, CheckCircleIcon, XCircleIcon, QuestionCircleIcon, ChatIcon, SeverityDot } from '../../components/ui/Icons';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/dashboard');
    }

    if (isAuthenticated && isAdmin) {
      fetchSubmissions(activeTab, severityFilter);
    }
  }, [isAuthenticated, isAdmin, authLoading, activeTab, severityFilter, navigate]);

  const fetchSubmissions = async (tab, sev) => {
    setLoading(true);
    try {
      let url;
      if (tab === 'pending') {
        url = '/admin/submissions/pending';
      } else {
        const params = new URLSearchParams();
        if (tab !== 'all') params.append('status', tab);
        if (sev) params.append('severity', sev);
        url = `/admin/submissions/all?${params}`;
      }
      const res = await api.get(url);
      setSubmissions(res.data);
    } catch (err) {
      setError('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner fullScreen />;

  const tabs = [
    { key: 'pending', label: 'Pending', icon: <BellIcon className="w-4 h-4" />, count: submissions.filter(s => s.status === 'pending').length },
    { key: 'all', label: 'All', icon: <ChartIcon className="w-4 h-4" />, count: submissions.length },
    { key: 'approved', label: 'Approved', icon: <CheckCircleIcon className="w-4 h-4" />, count: submissions.filter(s => s.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', icon: <XCircleIcon className="w-4 h-4" />, count: submissions.filter(s => s.status === 'rejected').length },
    { key: 'needs_more_info', label: 'Needs Info', icon: <QuestionCircleIcon className="w-4 h-4" />, count: submissions.filter(s => s.status === 'needs_more_info').length },
  ];

  return (
    <PageContainer className="py-8">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-gold to-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <p className="text-gray-600">Manage programs and review vulnerability reports.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/programs')}>
              <TargetIcon className="w-4 h-4 mr-1.5" /> Programs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/leaderboard')}>
              <LeaderboardIcon className="w-4 h-4 mr-1.5" /> Leaderboard
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

      {/* Tabs and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === tab.key
                  ? 'bg-cyber-blue text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
              {tab.label} <span className="ml-1 text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          
          {activeTab === 'pending' && submissions.length > 0 && (
            <p className="text-sm text-gray-600">
              <strong>{submissions.length}</strong> submission(s) awaiting review
            </p>
          )}
        </div>
      </div>

      {/* Submissions List */}
      {!loading && submissions.length === 0 && !error && (
        <Card>
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg text-gray-600">No submissions found for this filter.</p>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub._id || sub.id} padding="lg" className="hover:shadow-card-hover transition-all border-l-4 border-l-cyber-blue">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant={sub.severity} size="md">
                    {sub.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {sub.vuln_type?.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={sub.status === 'pending' ? 'warning' : sub.status === 'approved' ? 'success' : sub.status === 'rejected' ? 'danger' : 'info'} 
                    size="md"
                  >
                    {sub.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {sub.messages?.length > 0 && (
                    <Badge variant="primary" size="sm">
                      <ChatIcon className="w-3 h-3 mr-1" /> {sub.messages.length}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{sub.title}</h3>
                <p className="text-sm text-gray-600">
                  Submitted by <strong className="text-gray-900">{sub.submitted_by}</strong>
                </p>
              </div>

              <Button
                onClick={() => navigate(`/admin/review/${sub._id || sub.id}`)}
                variant="primary"
                size="md"
                className="flex-shrink-0"
              >
                Review Report →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;