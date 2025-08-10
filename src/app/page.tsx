'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import Loader from '@/components/ui/Loader';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Ne faire la redirection que si le chargement est terminé
    // et que nous sommes bien sur la page d'accueil
    if (!isLoading && typeof window !== 'undefined' && window.location.pathname === '/') {
      if (user) {
        const isCoach = user.email === 'remy.denay6@gmail.com';
        const dashboardPath = isCoach ? '/coach/dashboard' : '/client/suivi';
        router.replace(dashboardPath);
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Pendant le chargement, afficher uniquement un loader
  // Cela empêchera l'affichage de la page "non trouvée"
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader size="xl" />
          <p className="mt-4 text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Cette partie ne devrait jamais être visible car les redirections sont gérées ci-dessus
  // On la garde comme fallback au cas où
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <Loader size="xl" />
        <p className="mt-4 text-gray-600">Chargement en cours...</p>
      </div>
    </div>
  );
}
