import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Textarea from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ShieldIcon, UserIcon } from '../../components/ui/Icons';

const API_BASE = '';

const ReviewSubmission = () => {
  const { submission_id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/dashboard');
    }

    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/submissions/${submission_id}`);
        setSubmission(response.data);
        if (response.data?.messages) setMessages(response.data.messages);
      } catch (err) {
        setError('Could not load submission details. It may have been deleted or moved.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) fetchSubmission();
  }, [submission_id, isAuthenticated, isAdmin, authLoading, navigate]);

  const handleReview = async (decision) => {
    setReviewing(true);
    setError('');
    try {
      await api.post(`/admin/submissions/${submission_id}/review`, { decision });
      setSuccess(`Submission has been successfully ${decision}d.`);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else {
        setError(detail || 'Failed to process review decision.');
      }
      setReviewing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    setError('');
    try {
      const res = await api.post(`/admin/submissions/${submission_id}/message`, { message: newMessage });
      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner fullScreen />;
  if (error && !submission) return (
    <PageContainer className="py-10">
      <Alert variant="error">{error}</Alert>
    </PageContainer>
  );

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 0v14" />
            </svg>
            Back to Queue
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Submission</h1>
            <p className="text-sm text-gray-600">Evaluate the vulnerability report and take action</p>
          </div>
        </div>
      </div>

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Details */}
          <Card padding="lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Title</p>
                <h2 className="text-2xl font-bold text-gray-900">{submission.title}</h2>
              </div>
              <Badge variant={submission.severity} size="lg">
                {submission.severity.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vulnerability Type</p>
                <p className="font-semibold text-gray-900">{submission.vuln_type?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Submitted By</p>
                <p className="font-semibold text-gray-900">{submission.submitted_by}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</p>
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">{submission.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Steps to Reproduce</p>
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">{submission.steps_to_reproduce}</p>
            </div>
          </Card>

          {/* PoC Files */}
          {submission.poc_files?.length > 0 && (
            <Card padding="lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Evidence Files</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.poc_files.map((f, i) => {
                  const fullUrl = f.startsWith('http') ? f : `${API_BASE}${f}`;
                  const isVideo = f.match(/\.mp4$/i);
                  return isVideo
                    ? <video key={i} src={fullUrl} controls className="w-full rounded-lg border-2 border-gray-200 shadow-sm" />
                    : <img key={i} src={fullUrl} alt={`PoC ${i + 1}`} className="w-full rounded-lg border-2 border-gray-200 shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />;
                })}
              </div>
            </Card>
          )}

          {/* Communication Thread */}
          <Card padding="lg">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Communication Thread</p>
            <div className="max-h-[500px] overflow-y-auto mb-4 space-y-3 bg-gray-50 p-4 rounded-lg">
              {messages.length === 0
                ? <p className="text-gray-500 italic text-center py-8">No messages yet. Start the conversation.</p>
                : messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg ${m.sender_role === 'admin' ? 'bg-blue-100 border border-blue-200 ml-8' : 'bg-white border border-gray-200 mr-8'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {m.sender_role === 'admin' ? <><ShieldIcon className="w-3 h-3 inline mr-1" />You (Admin)</> : <><UserIcon className="w-3 h-3 inline mr-1" />Reporter</>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(m.sent_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900">{m.message}</p>
                  </div>
                ))
              }
            </div>
            <div className="border-t border-gray-200 pt-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Request more details from the reporter..."
                rows={3}
                className="mb-3"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendingMsg || !newMessage.trim()}
                loading={sendingMsg}
                variant="info"
              >
                Send Message
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card padding="lg" className="bg-cyber-dark text-white border-none">
            <h3 className="text-sm font-semibold uppercase mb-4 text-gray-300">Submission Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <Badge 
                  variant={submission.status === 'pending' ? 'warning' : submission.status === 'approved' ? 'success' : submission.status === 'rejected' ? 'danger' : 'info'} 
                  size="md"
                >
                  {submission.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Severity</span>
                <Badge variant={submission.severity} size="md">
                  {submission.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Review Actions */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold uppercase mb-4 text-gray-700">Review Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => handleReview('approve')}
                disabled={reviewing || !!success}
                variant="success"
                size="lg"
                className="w-full"
              >
                {reviewing ? 'Processing...' : '✓ Approve & Award'}
              </Button>
              <Button
                onClick={() => handleReview('reject')}
                disabled={reviewing || !!success}
                variant="danger"
                size="lg"
                className="w-full"
              >
                {reviewing ? 'Processing...' : '✕ Reject Submission'}
              </Button>
            </div>
            {success && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                Redirecting to queue...
              </p>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReviewSubmission;