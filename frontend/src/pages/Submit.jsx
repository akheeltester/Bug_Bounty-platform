import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Submit = () => {
  const [formData, setFormData] = useState({
    program_id: '',
    vuln_type: '',
    severity: '',
    title: '',
    description: '',
    steps_to_reproduce: '',
  });

  const [pocFiles, setPocFiles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const VULN_TYPES = ['sqli', 'xss', 'idor', 'broken_auth', 'misconfig', 'other'];
  const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'];

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs');
        setPrograms(response.data);
      } catch (err) {
        setError('Could not load programs. Please refresh the page.');
      }
    };
    fetchPrograms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4'];

    const invalidFiles = files.filter(f => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      return !allowedTypes.includes(f.type) && !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file types. Only .jpg, .jpeg, .png, and .mp4 are allowed.`);
      setPocFiles([]);
      return;
    }

    setPocFiles(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('program_id', formData.program_id);
      data.append('vuln_type', formData.vuln_type);
      data.append('severity', formData.severity);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('steps_to_reproduce', formData.steps_to_reproduce);
      pocFiles.forEach(f => data.append('poc_files', f));

      await api.post('/submissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Vulnerability report submitted successfully! Review pending.');
      setPocFiles([]);
      setFormData({
        program_id: '',
        vuln_type: '',
        severity: '',
        title: '',
        description: '',
        steps_to_reproduce: '',
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(', '));
      } else {
        setError(detail || 'Failed to submit report. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="py-8">
      <PageHeader
        title="Submit Vulnerability Report"
        subtitle="Provide detailed information to help our team validate your finding."
      />

      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Program Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Step 1: Select Target Program</h3>
              <Select
                label="Target Program"
                name="program_id"
                value={formData.program_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose a program...</option>
                {programs.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </div>

            {/* Vulnerability Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Step 2: Vulnerability Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Vulnerability Type"
                  name="vuln_type"
                  value={formData.vuln_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type...</option>
                  {VULN_TYPES.map(t => (
                    <option key={t} value={t}>{t.toUpperCase()}</option>
                  ))}
                </Select>

                <Select
                  label="Severity Level"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select severity...</option>
                  {SEVERITY_LEVELS.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-6">
                <Input
                  label="Report Title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief summary (e.g., XSS on /profile)"
                  required
                />
              </div>
            </div>

            {/* Description & Steps */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Step 3: Detailed Information</h3>
              <div className="space-y-6">
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed explanation of the vulnerability, its impact, and potential exploitation scenarios."
                  rows={5}
                  required
                />

                <Textarea
                  label="Steps to Reproduce"
                  name="steps_to_reproduce"
                  value={formData.steps_to_reproduce}
                  onChange={handleChange}
                  placeholder="1. Navigate to... 2. Click on... 3. Observe..."
                  rows={5}
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Step 4: Proof of Concept (Optional)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-cyber-blue transition-colors bg-white">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m0 0l3-3" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyber-blue hover:text-blue-600 focus-within:outline-none">
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.mp4"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, JPEG, PNG, or MP4 (max 5MB each)</p>
                </div>
              </div>
              {pocFiles.length > 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>✓ {pocFiles.length}</strong> file(s) selected: {pocFiles.map(f => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Submitting Report...' : 'Submit Vulnerability Report'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Submit;