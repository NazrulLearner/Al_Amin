// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'cashier' | 'member' | 'super_admin' | 'manager' | 'accountant' | 'collector')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userData, somityInfo, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  // Super admin has access to everything
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (!userData || !somityInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ডাটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Role-based access control
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = userData.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(`Access denied: User role ${userRole} not in allowed roles ${allowedRoles}`);
      
      // Role অনুযায়ী redirect
      switch(userRole) {
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        case 'cashier':
          return <Navigate to="/cashier-dashboard" replace />;
        case 'collector':
          return <Navigate to="/collector/dashboard" replace />;
        case 'member':
          return <Navigate to="/member-dashboard" replace />;
        case 'accountant':
        case 'manager':
          return <Navigate to="/admin-dashboard" replace />;
        default:
          return <Navigate to="/welcome" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
