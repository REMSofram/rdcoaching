'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  role: 'client' | 'coach' | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'client' | 'coach' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier d'abord si nous sommes dans un environnement navigateur
    if (typeof window === 'undefined') {
      console.log('[AuthContext] Exécution côté serveur, arrêt du chargement');
      setIsLoading(false);
      return;
    }

    console.log('[AuthContext] Initialisation du contexte d\'authentification');

    // Fonction pour obtenir la session actuelle
    const getSession = async () => {
      try {
        console.log('[AuthContext] Récupération de la session...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Erreur lors de la récupération de la session:', error);
        }
        
        if (currentSession?.user) {
          console.log('[AuthContext] Session utilisateur trouvée:', { 
            email: currentSession.user.email,
            emailConfirmed: !!currentSession.user.email_confirmed_at
          });
          setUser(currentSession.user);
          const isCoach = currentSession.user.email === 'remy.denay6@gmail.com';
          console.log(`[AuthContext] Définition du rôle: ${isCoach ? 'coach' : 'client'}`);
          setRole(isCoach ? 'coach' : 'client');
        } else {
          console.log('[AuthContext] Aucune session utilisateur trouvée');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Obtenir la session actuelle
    getSession();

    // Écouter les changements d'état d'authentification
    console.log('[AuthContext] Configuration de l\'écouteur d\'événements d\'authentification');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Événement d'authentification: ${event}`, { 
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      });
      
      setIsLoading(true);
      try {
        if (session?.user) {
          console.log('[AuthContext] Mise à jour de l\'utilisateur et du rôle');
          setUser(session.user);
          const isCoach = session.user.email === 'remy.denay6@gmail.com';
          const userRole = isCoach ? 'coach' : 'client';
          console.log(`[AuthContext] Définition du rôle: ${userRole}`);
          setRole(userRole);
          
          // Rediriger après la connexion initiale uniquement
          if (event === 'SIGNED_IN') {
            console.log('[AuthContext] Connexion détectée, vérification de l\'email');
            // Ne rediriger que si on n'est pas déjà sur une page protégée
            const currentPath = window.location.pathname;
            const isOnProtectedRoute = currentPath.startsWith('/coach/') || 
                                     currentPath.startsWith('/client/') || 
                                     currentPath === '/onboarding';
            
            if (!isOnProtectedRoute) {
              // Vérifier si l'email est confirmé
              if (session.user.email_confirmed_at) {
                const redirectPath = isCoach ? '/coach/dashboard' : '/client/dashboard';
                console.log(`[AuthContext] Redirection vers: ${redirectPath}`);
                router.push(redirectPath);
              } else {
                console.log('[AuthContext] Email non confirmé, redirection vers la vérification');
                router.push('/auth/verify-email');
              }
            } else {
              console.log(`[AuthContext] Déjà sur une page protégée: ${currentPath}, pas de redirection`);
            }
          }
        } else {
          setUser(null);
          setRole(null);
          const currentPath = window.location.pathname;
          console.log(`[AuthContext] Déconnexion détectée, chemin actuel: ${currentPath}`);
          // Rediriger vers la page de connexion si l'utilisateur est déconnecté
          if (!['/auth/login', '/auth/signup', '/auth/verify-email', '/'].includes(currentPath)) {
            console.log(`[AuthContext] Redirection vers la page de connexion depuis: ${currentPath}`);
            router.push('/auth/login');
          } else {
            console.log('[AuthContext] Pas de redirection nécessaire, déjà sur une page publique');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la gestion du changement d\'état d\'authentification:', error);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Récupérer l'utilisateur actuel
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          throw error;
        }
        
        if (user) {
          setUser(user);
          const isCoach = user.email === 'remy.denay6@gmail.com';
          const userRole = isCoach ? 'coach' : 'client';
          setRole(userRole);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        // En cas d'erreur, déconnecter l'utilisateur pour éviter tout problème de session
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Appeler la fonction pour récupérer l'utilisateur actuel
    getCurrentUser();

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Créer le compte utilisateur dans l'authentification
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: 'client',
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email?type=signup`,
        },
      });

      if (signUpError) throw signUpError;

      // Le profil est maintenant créé automatiquement par le trigger côté serveur
      // Pas besoin de créer manuellement le profil ici

      // Rediriger vers la page de vérification d'email
      if (data.user) {
        return { error: null };
      }

      return { error: new Error('Erreur lors de la création du compte') };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const updateProfile = async (profileData: any) => {
    try {
      console.log('Début de la mise à jour du profil avec les données:', profileData);
      
      // Récupérer l'utilisateur actuel
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
        throw userError;
      }
      
      if (!currentUser) {
        const error = new Error('Utilisateur non connecté');
        console.error(error.message);
        throw error;
      }

      // Préparer les données de mise à jour
      const updates = {
        ...profileData,
        id: currentUser.id,
        updated_at: new Date().toISOString(),
      };

      console.log('Tentative d\'upsert avec les données:', updates);
      
      // Effectuer la mise à jour
      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      console.log('Réponse de Supabase:', { data, error: upsertError });
      
      if (upsertError) {
        console.error('Erreur lors de l\'upsert du profil:', upsertError);
        throw upsertError;
      }
      
      console.log('Profil mis à jour avec succès');
      return { error: null, data };
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { error, data: null };
    }
  };

  const value = {
    user,
    role,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
