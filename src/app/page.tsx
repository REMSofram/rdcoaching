'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // L'utilisateur est connecté, rediriger vers le tableau de bord approprié
        const isCoach = user.email === 'remy.denay6@gmail.com';
        const dashboardPath = isCoach ? '/coach/dashboard' : '/client/dashboard';
        router.push(dashboardPath);
      } else {
        // L'utilisateur n'est pas connecté, rediriger vers la page de connexion
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Afficher un indicateur de chargement pendant la vérification de l'état d'authentification
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
