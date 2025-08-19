"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

// Délai de debounce pour éviter les multiples appels
const DEBOUNCE_DELAY = 1000;

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEstablished, setSessionEstablished] = useState<boolean>(false);
  const [urlProcessed, setUrlProcessed] = useState<boolean>(false);
  const processingRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyer l'URL après utilisation pour éviter les rechargements
  const cleanupUrl = (fromHash: boolean = false) => {
    if (typeof window === 'undefined') return;
    
    // Utiliser replaceState pour nettoyer l'URL sans recharger la page
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log(`[CreateAccount] URL nettoyée après traitement (fromHash: ${fromHash})`);
  };

  // Fonction pour extraire les paramètres de l'URL
  const getUrlParams = () => {
    if (typeof window === 'undefined') {
      return {
        access_token: null,
        refresh_token: null,
        type: 'unknown',
        fromHash: false
      };
    }

    // Vérifier d'abord le hash (pour les liens d'invitation)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken) {
        console.log(`[CreateAccount] Token trouvé dans le hash (type: ${type || 'inconnu'})`);
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          type: type || 'invite',
          fromHash: true
        };
      }
    }
    
    // Vérifier les query params (pour la rétrocompatibilité)
    const urlSearchParams = new URLSearchParams(window.location.search);
    const accessToken = urlSearchParams.get('access_token');
    
    if (accessToken) {
      console.log('[CreateAccount] Token trouvé dans les query params');
      return {
        access_token: accessToken,
        refresh_token: urlSearchParams.get('refresh_token'),
        type: urlSearchParams.get('type') || 'magiclink',
        fromHash: false
      };
    }
    
    console.log('[CreateAccount] Aucun token trouvé dans l\'URL');
    return {
      access_token: null,
      refresh_token: null,
      type: 'unknown',
      fromHash: false
    };
  };

  // Vérifier et traiter la session
  const processSession = async () => {
    if (processingRef.current) {
      console.log('[CreateAccount] Déjà en cours de traitement, on ignore');
      return;
    }

    processingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('[CreateAccount] Vérification de la session...');
      
      // 1. Vérifier si on a déjà une session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        console.log('[CreateAccount] Session existante trouvée');
        setSessionEstablished(true);
        setEmail(existingSession.user.email || '');
        return;
      }

      // 2. Vérifier les tokens dans l'URL
      const { access_token, refresh_token, type, fromHash } = getUrlParams();
      
      if (!access_token) {
        console.log('[CreateAccount] Aucun token dans l\'URL, vérification de la session');
        return;
      }

      console.log(`[CreateAccount] Tentative de connexion avec token (type: ${type})`);
      
      // 3. Définir la session manuellement
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || ''
      });

      if (sessionError) {
        console.error('[CreateAccount] Erreur lors de la définition de la session:', sessionError);
        throw sessionError;
      }
      
      if (sessionData?.session) {
        console.log('[CreateAccount] Session établie avec succès');
        setSessionEstablished(true);
        setEmail(sessionData.session.user.email || '');
        
        // Nettoyer l'URL après avoir établi la session
        cleanupUrl();
      } else {
        console.error('[CreateAccount] Aucune session retournée après setSession');
        throw new Error('Échec de la création de la session');
      }
    } catch (err) {
      console.error('[CreateAccount] Erreur lors du traitement de la session:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      processingRef.current = false;
      setUrlProcessed(true);
    }
  };

  // Effet principal avec debounce
  useEffect(() => {
    if (urlProcessed) return;
    
    console.log('[CreateAccount] Démarrage du traitement de la session');
    
    // Annuler tout timer existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Démarrer un nouveau timer avec debounce
    timeoutRef.current = setTimeout(() => {
      processSession();
    }, DEBOUNCE_DELAY);
    
    // Nettoyer le timer au démontage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [urlProcessed]);
  
  // Vérifier la session au chargement
  useEffect(() => {
    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('[CreateAccount] Vérification de la session...');
        
        // 1. Vérifier si on a déjà une session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[CreateAccount] Erreur lors de la récupération de la session:', sessionError);
          throw sessionError;
        }
        
        if (session) {
          console.log('[CreateAccount] Session existante trouvée pour:', session.user.email);
          if (isMounted) {
            setSessionEstablished(true);
            setEmail(session.user.email || '');
            
            // Récupérer les métadonnées utilisateur si disponibles
            if (session.user.user_metadata) {
              setFirstName(session.user.user_metadata.first_name || '');
              setLastName(session.user.user_metadata.last_name || '');
            }
          }
          return;
        }
        
        // 2. Vérifier les tokens dans l'URL
        const { access_token, refresh_token, type, fromHash } = getUrlParams();
        
        if (!access_token) {
          console.log('[CreateAccount] Aucun token dans l\'URL, vérification de la session');
          throw new Error('Aucun jeton d\'accès trouvé. Veuillez utiliser le lien d\'invitation.');
        }
        
        console.log(`[CreateAccount] Token de type '${type}' trouvé, tentative de connexion...`);
        
        // 3. Définir la session manuellement
        console.log('[CreateAccount] Définition de la session avec les tokens...');
        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || ''
        });
        
        if (setSessionError || !sessionData?.session) {
          console.error('[CreateAccount] Erreur de session après invitation:', setSessionError);
          throw new Error(setSessionError?.message || 'Impossible de créer une session avec le jeton fourni');
        }
        
        console.log('[CreateAccount] Session créée avec succès pour:', sessionData.user?.email);
        
        // Nettoyer l'URL après avoir établi la session
        cleanupUrl(fromHash);
        
        // 4. Récupérer les informations utilisateur complètes
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error('[CreateAccount] Erreur de récupération utilisateur:', userError);
          throw new Error(userError?.message || 'Session invalide. Veuillez utiliser le lien d\'invitation.');
        }
        
        const currentUser = userData.user;
        console.log('[CreateAccount] Utilisateur récupéré avec succès:', currentUser.email);
        
        // Mettre à jour l'état avec les données utilisateur
        if (isMounted) {
          setSessionEstablished(true);
          setEmail(currentUser.email || '');
          
          // Récupérer les métadonnées utilisateur si disponibles
          if (currentUser.user_metadata) {
            setFirstName(currentUser.user_metadata.first_name || '');
            setLastName(currentUser.user_metadata.last_name || '');
          } else {
            // Essayer de récupérer les métadonnées depuis la table profiles
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', currentUser.id)
              .single();
              
            if (profileData) {
              setFirstName(profileData.first_name || '');
              setLastName(profileData.last_name || '');
            }
          }
        }
        
      } catch (err) {
        console.error('[CreateAccount] Erreur lors de la vérification de la session:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
          
          // Rediriger vers la page de connexion après un délai
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.push('/auth/login');
            }
          }, 5000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setUrlProcessed(true);
        }
      }
    };
    
    // Appeler la vérification de session
    checkSession();
    
    // Nettoyage
    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [router]); // Exécuté une seule fois au montage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      });
      
      if (updateError) throw updateError;
      
      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          is_onboarded: false, // Laisser l'onboarding à false pour forcer la redirection
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
        
      if (profileError) throw profileError;
      
      // Rafraîchir la session avant la redirection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session) {
        // Mettre à jour l'état local avec la nouvelle session
        setSessionEstablished(true);
        
        // Rafraîchir la page pour s'assurer que le middleware s'exécute
        // avec les dernières données de session
        window.location.href = '/onboarding';
      } else {
        console.error('Aucune session valide après la création du compte');
        setError('Erreur lors de la création de la session. Veuillez vous connecter manuellement.');
      }
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du compte:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                disabled
              />
            </div>
            <div>
              <label htmlFor="firstName" className="sr-only">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
