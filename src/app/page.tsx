'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirection uniquement si l'utilisateur est sur la racine du site
    if (!isLoading && window.location.pathname === '/') {
      if (user) {
        const isCoach = user.email === 'remy.denay6@gmail.com';
        const dashboardPath = isCoach ? '/coach/dashboard' : '/client/dashboard';
        router.push(dashboardPath);
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Cette page ne devrait normalement pas être visible car la redirection se fait dans le middleware
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
        <p className="mb-6">La page que vous cherchez n'existe pas ou vous n'avez pas les droits nécessaires pour y accéder.</p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button variant="outline">Se connecter</Button>
          </Link>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
