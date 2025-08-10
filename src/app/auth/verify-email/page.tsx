'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Vérification d&apos;email
          </h2>
          <p className="mt-4 text-gray-600">
            Un email de vérification a été envoyé à votre adresse email.
          </p>
          <p className="mt-2 text-gray-600">
            Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre adresse email.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
