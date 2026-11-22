/* src/modules/public/components/layout/PublicLayout.tsx */
import { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthProvider';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface Props {
  children?: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  const { loading } = useAuth();

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-emerald-700" />
    </div>
  );
}

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
