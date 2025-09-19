'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProfilePicture } from '@/components/shared/ProfilePicture';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    };

    fetchProfile();
  }, [user?.id]);

  const updateProfilePicture = async (url: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ profile_picture_url: url })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    } else {
      setProfile((prev: any) => ({
        ...prev,
        profile_picture_url: url,
      }));
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">Veuillez vous connecter pour voir votre profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
          <div className="flex-shrink-0">
            <ProfilePicture
              userId={user.id}
              currentPictureUrl={profile?.profile_picture_url}
              onPictureUpdate={updateProfilePicture}
              size="lg"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile?.first_name || 'Utilisateur'}
            </h1>
            
            <div className="mt-4 space-y-2 text-gray-600">
              <p><span className="font-medium">Email :</span> {user.email}</p>
              {profile?.phone && (
                <p><span className="font-medium">Téléphone :</span> {profile.phone}</p>
              )}
              {profile?.birth_date && (
                <p>
                  <span className="font-medium">Date de naissance :</span>{' '}
                  {new Date(profile.birth_date).toLocaleDateString('fr-FR')}
                </p>
              )}
              {profile?.height && (
                <p><span className="font-medium">Taille :</span> {profile.height} cm</p>
              )}
              {profile?.starting_weight && (
                <p><span className="font-medium">Poids de départ :</span> {profile.starting_weight} kg</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
