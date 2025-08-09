'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Mon Profil Client
          </h1>
          {user ? (
            <p className="text-gray-600 text-lg">
              Connecté en tant que : <span className="font-medium">{user.email}</span>
            </p>
          ) : (
            <p className="text-gray-600 text-lg">Non connecté</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
