// src/app/routes/DashboardRedirect.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const DashboardRedirect: React.FC = () => {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Not logged in - go to welcome
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Route based on role
  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'cashier':
      return <Navigate to="/cashier-dashboard" replace />;
    case 'collector':
      return <Navigate to="/collector/dashboard" replace />;
    case 'member':
      return <Navigate to="/member-dashboard" replace />;
    default:
      return <Navigate to="/member-dashboard" replace />;
  }
};

export default DashboardRedirect;
