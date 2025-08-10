import { supabase } from './supabase';

type UserRole = 'client' | 'coach';

import { User, Session } from '@supabase/supabase-js';

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, session: data.session, error };
};

interface UserSignUpData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  [key: string]: unknown;
}

export const signUpWithEmail = async (email: string, password: string, userData: UserSignUpData): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        role: 'client', // Default role
      },
    },
  });
  return { user: data.user, session: data.session, error };
};

export const signInWithMagicLink = async (email: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUserRole = async (): Promise<UserRole | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Check if user is the coach
  if (user.email === 'remy.denay6@gmail.com') {
    return 'coach';
  }
  return 'client';
};

export const isCoach = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'coach';
};

export const isClient = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'client';
};

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  date_of_birth?: string;
  height?: number;
  starting_weight?: number;
  weight?: number;
  sports_practiced?: string | string[];
  sports?: string | string[];
  objectives?: string;
  goals?: string;
  injuries?: string | string[];
  medicalHistory?: string | string[];
  role?: string;
  [key: string]: unknown;
}

export const updateProfile = async (profileData: ProfileUpdateData): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // Mapper les champs du formulaire vers le schéma de la base de données
    const updates = {
      id: user.id,
      email: user.email, // Ajouter l'email de l'utilisateur
      first_name: profileData.first_name || profileData.firstName, // Gérer les deux formats
      last_name: profileData.last_name || profileData.lastName,
      phone: profileData.phone,
      birth_date: profileData.birth_date || profileData.date_of_birth, // Gérer les deux formats
      height: profileData.height,
      starting_weight: profileData.starting_weight || profileData.weight, // Si le poids est fourni
      sports_practiced: profileData.sports_practiced || profileData.sports,
      objectives: profileData.objectives || profileData.goals, // 'goals' est utilisé dans le formulaire
      injuries: profileData.injuries || profileData.medicalHistory, // 'medicalHistory' est utilisé dans le formulaire
      role: profileData.role || 'client', // Valeur par défaut
      is_onboarded: true,
      updated_at: new Date().toISOString()
    };

    console.log('Mise à jour du profil avec les données:', updates);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' })
      .select();

    console.log('Réponse de la base de données:', { data, error });

    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Erreur dans updateProfile:', error);
    return { error: error as Error };
  }
};
