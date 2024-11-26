import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole = null }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const hasRequiredRole = requiredRole === 'faculty' ? user.is_faculty : !user.is_faculty;
    if (!hasRequiredRole) {
      return <Navigate to={user.is_faculty ? '/faculty-dashboard' : '/student-dashboard'} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
