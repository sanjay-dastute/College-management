import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ERROR_MESSAGES } from '../constants';
import { useToast } from '@chakra-ui/react';

function PrivateRoute({ children, requiredRole = null }) {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();

  if (!user) {
    toast({
      title: 'Authentication Required',
      description: ERROR_MESSAGES.UNAUTHORIZED,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const hasRequiredRole = requiredRole === 'faculty' ? user.is_faculty : !user.is_faculty;
    if (!hasRequiredRole) {
      toast({
        title: 'Access Denied',
        description: ERROR_MESSAGES.UNAUTHORIZED,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return <Navigate
        to={user.is_faculty ? ROUTES.FACULTY_DASHBOARD : ROUTES.STUDENT_DASHBOARD}
        replace
      />;
    }
  }

  return children;
}

export default PrivateRoute;
