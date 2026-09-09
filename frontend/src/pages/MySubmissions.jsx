import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ChatIcon, ShieldIcon, UserIcon } from '../components/ui/Icons';

const API_BASE = '';

const statusVariant = {
  pending: 'warning',
  needs_more_info: 'info',
  approved: 'success',
  rejected: 'danger',
  duplicate: 'default',
};

const MySubmissions = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
    if (isAuthenticated) {
      api.get('/submissions/me').then(r => setSubmissions(r.data)).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleReply = async (subId) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/submissions/${subId}/reply`, { message: reply });
      setSubmissions(prev => prev.map(s =>
        s._id === subId ? { ...s, messages: [...(s.messages || []), res.data.message] } : s
      ));
      setReply('');
    } catch (err) {
      setError('Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner fullScreen />;

  return (
    <PageContainer className="py-8">
      <PageHeader
        title="My Submissions"
        subtitle="Track the status of your vulnerability reports and communicate with the review team."
        action={
          <Button onClick={() => navigate('/submit')} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Submission
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {submissions.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No submissions yet"
            description="Start hunting and submit your first vulnerability report!"
            action={
              <Button onClick={() => navigate('/submit')} size="lg">
                Submit Your First Report →
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <Card key={sub._id} padding="none" className="overflow-hidden hover:shadow-card-hover transition-shadow">
              {/* Collapsible Header */}
              <div
                onClick={() => setExpanded(expanded === sub._id ? null : sub._id)}
                className="p-6 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{sub.title}</h3>
                      <Badge variant="default" size="sm">
                        {sub.vuln_type?.toUpperCase()}
                      </Badge>
                      {sub.messages?.length > 0 && (
                        <Badge variant="primary" size="sm">
                          <ChatIcon className="w-3 h-3 mr-1" /> {sub.messages.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Submitted {new Date(sub.created_at || sub.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(sub.reward_amount > 0 || sub.points_awarded > 0) && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Reward</p>
                        <p className="text-lg font-bold text-cyber-green">
                          ${sub.reward_amount > 0 ? sub.reward_amount.toFixed(2) : sub.points_awarded}
                        </p>
                      </div>
                    )}
                    <Badge variant={statusVariant[sub.status] || 'default'} size="md" className="min-w-[100px] justify-center">
                      {sub.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${expanded === sub._id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expanded === sub._id && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6 space-y-6">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{sub.description}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Steps to Reproduce</h4>
                        <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{sub.steps_to_reproduce}</p>
                      </div>
                    </div>

                    {/* PoC Files */}
                    {sub.poc_files?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Proof of Concept Files</h4>
                        <div className="flex flex-wrap gap-4">
                          {sub.poc_files.map((f, i) => {
                            const fullUrl = f.startsWith('http') ? f : `${API_BASE}${f}`;
                            const isVideo = f.match(/\.mp4$/i);
                            return isVideo
                              ? <video key={i} src={fullUrl} controls className="max-w-sm rounded-lg border-2 border-gray-200 shadow-sm" />
                              : <img key={i} src={fullUrl} alt={`PoC ${i + 1}`} className="max-w-sm rounded-lg border-2 border-gray-200 shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Communication Thread */}
                    {sub.messages?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Communication Thread</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto bg-white rounded-lg p-4 border border-gray-200">
                          {sub.messages.map((m, i) => (
                            <div 
                              key={i} 
                              className={`p-4 rounded-lg ${m.sender_role === 'admin' ? 'bg-blue-50 border border-blue-200 ml-8' : 'bg-gray-100 border border-gray-200 mr-8'}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-700">
                                  {m.sender_role === 'admin' ? <><ShieldIcon className="w-3 h-3 inline mr-1" />Admin</> : <><UserIcon className="w-3 h-3 inline mr-1" />You</>}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(m.sent_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-900 text-sm">{m.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply Section */}
                    {sub.status === 'needs_more_info' && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Reply to Admin</h4>
                        <Textarea
                          value={reply}
                          onChange={e => setReply(e.target.value)}
                          placeholder="Provide additional details or clarification..."
                          rows={3}
                          className="mb-3"
                        />
                        <Button
                          onClick={() => handleReply(sub._id)}
                          disabled={sending || !reply.trim()}
                          loading={sending}
                        >
                          {sending ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default MySubmissions;