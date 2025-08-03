'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Ne rien faire tant que le chargement est en cours
    if (isLoading) return;

    // Vérifier l'autorisation
    const checkAuth = () => {
      // Si l'utilisateur n'est pas connecté
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      // Si l'utilisateur n'a pas le bon rôle
      if (role && !allowedRoles.includes(role)) {
        router.push('/unauthorized');
        return;
      }

      // Si tout est bon
      setIsAuthorized(true);
    };

    checkAuth();
    setIsCheckingAuth(false);
  }, [user, role, isLoading, allowedRoles, router]);

  // Rediriger si non autorisé (une fois que le chargement est terminé)
  useEffect(() => {
    if (isAuthorized === false && !isLoading && !isCheckingAuth) {
      // Vérifier que nous ne sommes pas déjà sur la page de redirection
      if (!pathname.startsWith(redirectTo)) {
        router.push(redirectTo);
      }
    }
  }, [isAuthorized, isLoading, isCheckingAuth, router, redirectTo, pathname]);

  // Afficher le loader pendant la vérification de l'authentification
  if (isLoading || isCheckingAuth || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Si l'utilisateur est autorisé, afficher le contenu
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Par défaut, ne rien afficher (la redirection sera gérée par le useEffect)
  return null;
}
