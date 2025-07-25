'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'checking'>('checking');
  const [message, setMessage] = useState('Vérification en cours...');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const { user } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Lien de vérification invalide ou expiré.');
          return;
        }

        setStatus('loading');
        
        // Vérifier si l'email est déjà confirmé
        if (user?.email_confirmed_at) {
          setStatus('success');
          setMessage('Votre email a déjà été vérifié. Redirection...');
          setTimeout(() => {
            window.location.href = '/onboarding';
          }, 2000);
          return;
        }

        // Ici, vous devriez normalement envoyer le token à votre backend pour vérification
        // Pour l'instant, nous allons simuler une vérification avec un délai
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès ! Redirection vers l\'onboarding...');
        
        // Rediriger vers l'onboarding après un court délai
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification de votre email.');
      }
    };

    verifyEmail();
  }, [token, type, user]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Vérification en cours...</h2>
            <p className="text-gray-600">
              Nous vérifions votre lien de confirmation. Veuillez patienter.
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email vérifié avec succès !</h2>
            <p className="text-gray-600">
              {message}
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm">
                Redirection en cours...
              </div>
            </div>
          </>
        );
      
      case 'error':
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Erreur de vérification</h2>
            <p className="text-gray-600">
              {message}
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center shadow-md">
        {renderContent()}
      </div>
    </div>
  );
}
