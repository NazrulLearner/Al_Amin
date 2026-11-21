/* src/modules/public/components/layout/PublicLayout.tsx */
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../../app/providers/AuthProvider';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface Props {
  children?: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
