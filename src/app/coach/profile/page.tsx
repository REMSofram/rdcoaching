import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { User } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  // Récupérer les informations supplémentaires du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.full_name || 'Votre nom'}
            </h1>
            <p className="text-gray-600 mt-1">
              {profile?.role || 'Coach'}
            </p>
            <p className="text-gray-500 mt-2">
              {profile?.bio || 'Ajoutez une brève description à votre profil'}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {profile?.specialty || 'Spécialité non définie'}
              </span>
              {profile?.experience_years && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {profile.experience_years} ans d'expérience
                </span>
              )}
            </div>
          </div>
          
          <Link 
            href="/coach/profile/edit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Modifier le profil
          </Link>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Informations personnelles</h3>
            <div className="space-y-2">
              <p><span className="text-gray-500">Email :</span> {user?.email}</p>
              {profile?.phone && (
                <p><span className="text-gray-500">Téléphone :</span> {profile.phone}</p>
              )}
              {profile?.location && (
                <p><span className="text-gray-500">Localisation :</span> {profile.location}</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">À propos</h3>
            <p className="text-gray-700">
              {profile?.about || 'Ajoutez une description plus détaillée sur vous, votre parcours et votre approche du coaching.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
