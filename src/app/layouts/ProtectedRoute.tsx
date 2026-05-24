import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export type UserRole = 'admin' | 'cashier' | 'member' | 'super_admin' | 'collector';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userData, loading, isSuperAdmin } = useAuth();
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

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (allowedRoles?.length) {
    const userRole = userData?.role as UserRole | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      const redirectPath = (() => {
        switch (userRole) {
          case 'admin': return '/admin-dashboard';
          case 'cashier': return '/cashier-dashboard';
          case 'collector': return '/collector/dashboard';
          case 'member': return '/member-dashboard';
          default: return '/welcome';
        }
      })();
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;