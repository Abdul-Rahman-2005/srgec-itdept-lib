import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (!profile) {
        return;
      }
      if (profile.status !== 'active') {
        navigate('/account-status');
        return;
      }
      if (!allowedRoles.includes(profile.role)) {
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile || profile.status !== 'active' || !allowedRoles.includes(profile.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-16 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
