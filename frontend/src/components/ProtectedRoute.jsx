import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Enforce profile completion before accessing main app
  if (currentUser && !userProfile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  // Enforce required role for restricted routes
  if (requiredRole && userProfile?.role !== requiredRole) {
    // If user is logged in but doesn't have the right role, redirect to the main page
    return <Navigate to="/" />;
  }

  return children;
}
