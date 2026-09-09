import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';

import Programs from './pages/Programs';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import MySubmissions from './pages/MySubmissions';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewSubmission from './pages/admin/ReviewSubmission';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

const LoadingScreen = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif'
  }}>
    <div style={{
      border: '4px solid #f3f3f3', borderTop: '4px solid #007bff',
      borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite'
    }} />
    <p style={{ marginTop: '15px', color: '#666' }}>Initializing Secure Access...</p>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const UserOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleAwareHome = () => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Programs />;
};

const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
    <h1>404</h1>
    <p>Target Not Found. This endpoint does not exist.</p>
    <Navigate to="/" />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RoleAwareHome />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<UserOnlyRoute><Leaderboard /></UserOnlyRoute>} />

          <Route path="/dashboard" element={<UserOnlyRoute><Dashboard /></UserOnlyRoute>} />
          <Route path="/submit" element={<UserOnlyRoute><Submit /></UserOnlyRoute>} />
          <Route path="/my-submissions" element={<UserOnlyRoute><MySubmissions /></UserOnlyRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/programs" element={<AdminRoute><AdminPrograms /></AdminRoute>} />
          <Route path="/admin/review/:submission_id" element={<AdminRoute><ReviewSubmission /></AdminRoute>} />
          <Route path="/admin/leaderboard" element={<AdminRoute><AdminLeaderboard /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
