'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex
            ">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-primary">RD Coaching</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-primary px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Tableau de bord
                </Link>
                {role === 'coach' && (
                  <Link
                    href="/coach/clients"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Mes clients
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  Mon profil
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={() => signOut()}
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Bienvenue, {user.email?.split('@')[0]}!
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">Rôle: {role}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {role === 'coach' 
                ? 'Vous avez accès au tableau de bord coach.'
                : 'Vous avez accès à votre espace client.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {role === 'coach' ? (
              <>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Clients actifs
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">12</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        href="/coach/clients"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Voir tous les clients
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Suivis cette semaine
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">8/12</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <Link
                        href="/coach/check-ins"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Voir les suivis
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-indigo-500 p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Votre progression
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">65%</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      href="/client/progress"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Voir le détail
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Prochain rendez-vous
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {role === 'coach' ? 'Aujourd\'hui, 15:00' : 'Demain, 10:00'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href="/appointments"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Voir le calendrier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
