import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { QueueIcon, LeaderboardIcon, SeverityDot } from '../../components/ui/Icons';

const AdminPrograms = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultForm = {
    title: '', description: '', access_url: '',
    reward_critical: 1000, reward_high: 500, reward_medium: 250, reward_low: 100
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/dashboard');
    }
    if (isAuthenticated && isAdmin) fetchPrograms();
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/admin/programs');
      setPrograms(res.data);
    } catch {
      setError('Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(''); setSuccess('');
    try {
      const res = await api.post('/programs', formData);
      setPrograms(prev => [res.data, ...prev]);
      setSuccess(`Program "${res.data.title}" created!`);
      setFormData(defaultForm);
      setShowForm(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else {
        setError(detail || 'Failed to create program.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (program) => {
    setEditingId(program._id || program.id);
    setFormData({
      title: program.title || '',
      description: program.description || '',
      access_url: program.access_url || '',
      reward_critical: program.reward_critical ?? 1000,
      reward_high: program.reward_high ?? 500,
      reward_medium: program.reward_medium ?? 250,
      reward_low: program.reward_low ?? 100
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(''); setSuccess('');
    try {
      const res = await api.patch(`/programs/${editingId}`, formData);
      setPrograms(prev => prev.map(p => (p._id || p.id) === editingId ? res.data : p));
      setSuccess(`Program "${res.data.title}" updated!`);
      setFormData(defaultForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else {
        setError(detail || 'Failed to update program.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultForm);
    setError('');
  };

  const handleToggle = async (id, currentState) => {
    try {
      await api.patch(`/programs/${id}/toggle`);
      setPrograms(prev => prev.map(p => (p._id || p.id) === id ? { ...p, is_active: !currentState } : p));
    } catch {
      setError('Failed to toggle program.');
    }
  };

  if (authLoading || loading) return <LoadingSpinner fullScreen />;

  const severityLevels = [
    { key: 'reward_critical', label: 'Critical', variant: 'critical', severity: 'critical' },
    { key: 'reward_high', label: 'High', variant: 'high', severity: 'high' },
    { key: 'reward_medium', label: 'Medium', variant: 'medium', severity: 'medium' },
    { key: 'reward_low', label: 'Low', variant: 'low', severity: 'low' }
  ];

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
            <p className="text-gray-600 mt-1">Create and manage bug bounty programs</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
              <QueueIcon className="w-4 h-4 mr-1.5" /> Reports Queue
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/leaderboard')}>
              <LeaderboardIcon className="w-4 h-4 mr-1.5" /> Leaderboard
            </Button>
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(defaultForm); }}
              variant={showForm ? 'secondary' : 'success'}
              size="md"
            >
              {showForm ? '✕ Cancel' : '+ New Program'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card padding="lg" className={`mb-8 border-2 ${editingId ? 'border-blue-300 bg-blue-50/50' : 'border-green-300 bg-green-50/50'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-blue to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Program' : 'Create New Program'}
            </h2>
          </div>
          
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Program Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Main Web Application"
                required
              />

              <Input
                label="Target URL"
                type="url"
                value={formData.access_url}
                onChange={e => setFormData({ ...formData, access_url: e.target.value })}
                placeholder="http://target.local"
                required
              />
            </div>

            <Textarea
              label="Program Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the scope, rules, and target..."
              rows={4}
              required
            />

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-4">Reward Matrix (USD)</label>
              <div className="grid grid-cols-2 gap-4">
                {severityLevels.map(({ key, label, variant, severity }) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <SeverityDot severity={severity} className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">$</span>
                        <input
                          type="number"
                          value={formData[key]}
                          onChange={e => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="1"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-cyber-blue"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                variant={editingId ? 'primary' : 'success'}
                loading={submitting}
              >
                {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Program' : 'Create Program')}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Programs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Active Programs</h2>
          <Badge variant="default" size="md">{programs.length} total</Badge>
        </div>
        
        {programs.map(p => (
          <Card key={p._id || p.id} padding="lg" className="hover:shadow-card-hover transition-all">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                  <Badge variant={p.is_active ? 'success' : 'danger'} size="sm">
                    {p.is_active ? '✓ Active' : '✕ Inactive'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {severityLevels.map(({ key, label, variant, severity }) => (
                    <Badge key={key} variant={variant} size="md" className="flex items-center gap-1">
                      <SeverityDot severity={severity} className="w-3 h-3" /> {label}: ${p[`reward_${key.replace('reward_', '')}`] ?? 0}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={() => handleEdit(p)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggle(p._id || p.id, p.is_active)}
                  variant={p.is_active ? 'danger' : 'success'}
                  size="sm"
                >
                  {p.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {programs.length === 0 && !loading && (
          <Card>
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-lg text-gray-600 mb-4">No programs yet</p>
              <Button onClick={() => setShowForm(true)} variant="success">
                Create Your First Program
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default AdminPrograms;