// src/app/routes/DashboardRedirect.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const DashboardRedirect: React.FC = () => {
  const { user, userData, loading, isSuperAdmin } = useAuth();

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

  // Route based on role - use module-based routes
  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  if (!userData) {
    return <Navigate to="/welcome" replace />;
  }

  switch (userData.role) {
    case 'admin':
      return <Navigate to="/teams" replace />;
    case 'cashier':
      return <Navigate to="/cashier" replace />;
    case 'collector':
      return <Navigate to="/contributions" replace />;
    case 'manager':
    case 'accountant':
      return <Navigate to="/reports" replace />;
    case 'member':
      return <Navigate to="/members" replace />;
    default:
      return <Navigate to="/members" replace />;
  }
};

export default DashboardRedirect;

