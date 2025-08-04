'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Loader from '../ui/Loader';

type AuthInitializerProps = {
  children: React.ReactNode;
};

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { isLoading, user, role } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Dès que le chargement est terminé, marquer l'initialisation comme terminée
    if (!isLoading) {
      setIsInitializing(false);
    }
  }, [isLoading]);

  // Masquer le contenu pendant le chargement initial
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader size="xl" />
          <p className="mt-4 text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Une fois le chargement initial terminé, afficher le contenu
  return <>{children}</>;
}
