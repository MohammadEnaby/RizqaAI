import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Enforce profile completion before accessing main app
  if (currentUser && !userProfile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  // Enforce admin role for restricted routes
  if (adminOnly && userProfile?.role !== 'admin') {
    return <Navigate to="/chatbot" />;
  }

  return children;
}
