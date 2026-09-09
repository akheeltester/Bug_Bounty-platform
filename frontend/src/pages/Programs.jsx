import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HeroSection from '../components/features/HeroSection';
import ProgramCard from '../components/features/ProgramCard';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs');
        setPrograms(response.data);
      } catch (err) {
        setError('Failed to load programs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Bug Bounty Platform"
        subtitle="Find vulnerabilities, earn rewards, and climb the leaderboard. Test your skills against real-world targets."
        actions={
          <>
            <Link to="/register">
              <Button variant="success" size="lg">
                Start Hunting
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-cyber-dark">
                View Leaderboard
              </Button>
            </Link>
          </>
        }
      />

      {/* Programs List */}
      <PageContainer>
        <PageHeader
          title="Active Programs"
          subtitle="Find a target and start hunting."
        />

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {!loading && programs.length === 0 && !error && (
          <EmptyState
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No active bug bounty programs at this time."
            description="Check back later or contact an admin to add new programs."
          />
        )}

        <div className="grid gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id || program._id} program={program} />
          ))}
        </div>
      </PageContainer>
    </div>
  );
};

export default Programs;
