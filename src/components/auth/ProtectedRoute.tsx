'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/Loader';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'coach')[];
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  allowedRoles = ['client', 'coach'],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If user doesn't have required role, redirect to unauthorized or home
      if (role && !allowedRoles.includes(role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, role, isLoading, allowedRoles, router, redirectTo]);

  // Show loading state while checking auth status
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // If user has required role, render children
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Default return (should be caught by the useEffect redirects)
  return null;
}
