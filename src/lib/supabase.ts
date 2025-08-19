import { createBrowserClient } from '@supabase/ssr';

// Configuration de base pour Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Création du client Supabase avec configuration améliorée
const createClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: true
      },
      global: {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      },
      db: {
        schema: 'public',
      }
    }
  );
};

// Export de l'instance Supabase
export const supabase = createClient();

// Fonction utilitaire pour gérer les erreurs d'authentification
interface AuthError extends Error {
  status?: number;
  message: string;
  [key: string]: unknown;
}

export const handleAuthError = (error: unknown) => {
  console.error('Erreur d\'authentification:', error);
  
  // Type guard to check if error is an object with a message property
  const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return typeof e === 'object' && e !== null && 'message' in e;
  };

  // Si le token est invalide ou expiré, on déconnecte l'utilisateur
  if ((isErrorWithMessage(error) && 
      (error.message.includes('Invalid token') || 
       error.message.includes('Token expired'))) ||
      (error && typeof error === 'object' && 'status' in error && error.status === 401)) {
    supabase.auth.signOut()
      .then(() => {
        // Supprimer manuellement les cookies si nécessaire
        if (typeof document !== 'undefined') {
          document.cookie = 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      })
      .catch(err => {
        console.error('Erreur lors de la déconnexion:', err);
      });
  }
  
  return error;
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
};
