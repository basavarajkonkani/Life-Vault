import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'nominee' | 'admin';
  allowedRoles?: ('owner' | 'nominee' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && userProfile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userProfile.role === 'owner' ? '/' : 
                        userProfile.role === 'nominee' ? '/nominee-dashboard' : 
                        userProfile.role === 'admin' ? '/admin-dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user role is in allowed roles
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userProfile.role === 'owner' ? '/' : 
                        userProfile.role === 'nominee' ? '/nominee-dashboard' : 
                        userProfile.role === 'admin' ? '/admin-dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
