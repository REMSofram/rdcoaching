import { supabase } from '@/lib/supabase';

export interface ClientProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  height?: number;
  phone?: string;
  starting_weight?: number;
  current_weight?: number;
  sports_practiced?: string;
  objectives?: string;
  injuries?: string;
  created_at: string;
  updated_at: string;
}

export const fetchClients = async (): Promise<ClientProfile[]> => {
  try {
    console.log('Début de la récupération des profils depuis Supabase...');
    
    // Vérifier si l'utilisateur est authentifié
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Utilisateur connecté:', user);
    
    if (userError) {
      console.error('Erreur de récupération de l\'utilisateur:', userError);
    }
    
    // Note: La vérification des politiques RLS a été supprimée car non essentielle pour la récupération des profils
    // Les politiques RLS doivent être configurées directement dans l'interface Supabase
    
    // Récupérer tous les profils avec des logs détaillés
    console.log('Récupération de tous les profils...');
    const { data: profiles, error, status, statusText, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    console.log('Détails de la réponse:', { 
      status, 
      statusText, 
      count,
      error,
      hasData: !!profiles,
      dataLength: profiles?.length
    });
    
    if (profiles && profiles.length > 0) {
      console.log('Exemple de profil:', profiles[0]);
    }
    console.log('Erreur éventuelle:', error);
    
    // Vérifier la structure des profils
    if (profiles && profiles.length > 0) {
      console.log('Exemple de premier profil:', {
        keys: Object.keys(profiles[0]),
        values: profiles[0]
      });
      
      // Vérifier les rôles uniques
      const roles = [...new Set(profiles.map(p => p.role))];
      console.log('Rôles uniques trouvés:', roles);
    }

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    return profiles || [];
  } catch (error) {
    console.error('Error in fetchClients:', error);
    return [];
  }
};

export const fetchClientLogs = async (clientId: string) => {
  try {
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: false })
      .limit(3);

    if (error) throw error;
    
    return logs.map(log => ({
      ...log,
      date: new Date(log.log_date),
      status: log.completed ? 'completed' : log.missed ? 'missed' : 'pending'
    }));
  } catch (error) {
    console.error('Error fetching client logs:', error);
    return [];
  }
};

// Type pour les erreurs détaillées
type DetailedError = {
  message: string;
  code?: string;
  details?: any;
  stack?: string;
  timestamp: string;
};

export const updateClientProfile = async (clientId: string, updates: Partial<ClientProfile>) => {
  try {
    console.log('[updateClientProfile] Début de la mise à jour du profil client', {
      clientId,
      updates: JSON.stringify(updates, null, 2)
    });
    
    // Vérification des entrées
    if (!clientId) {
      const errorMsg = 'ID client manquant pour la mise à jour du profil';
      console.error('[updateClientProfile] Erreur:', errorMsg);
      return { data: null, error: { message: errorMsg } };
    }
    
    // Préparation des données à mettre à jour avec gestion des valeurs nulles/vides
    const updateData: Record<string, any> = {};
    const fieldsToUpdate = [
      'first_name', 'last_name', 'email', 'phone', 'birth_date',
      'height', 'starting_weight', 'sports_practiced', 'objectives', 'injuries'
    ];

    fieldsToUpdate.forEach(field => {
      const value = updates[field as keyof ClientProfile];
      
      // Gestion spéciale pour la date de naissance
      if (field === 'birth_date' && value) {
        try {
          // S'assurer que la date est au format ISO
          updateData[field] = new Date(value as string).toISOString();
        } catch (e) {
          console.warn(`[updateClientProfile] Format de date invalide pour ${field}:`, value);
          // Ne pas mettre à jour la date si le format est invalide
        }
      } 
      // Gestion des champs de type tableau
      else if ((field === 'sports_practiced' || field === 'injuries') && value !== undefined) {
        // Si c'est une chaîne, la convertir en tableau
        if (typeof value === 'string') {
          // Si la chaîne est vide, mettre un tableau vide
          if (value.trim() === '') {
            updateData[field] = [];
          } else {
            // Sinon, séparer par des virgules et nettoyer les espaces
            updateData[field] = value.split(',').map((item: string) => item.trim());
          }
        } else if (Array.isArray(value)) {
          // Si c'est déjà un tableau, le garder tel quel
          updateData[field] = value;
        } else if (value === '' || value === null) {
          // Si c'est vide ou null, mettre un tableau vide
          updateData[field] = [];
        }
      }
      // Gestion des champs numériques
      else if ((field === 'height' || field === 'starting_weight') && value !== undefined) {
        // Convertir en nombre ou null si vide
        updateData[field] = value === '' || value === null ? null : Number(value);
      }
      // Pour les autres champs, ne pas inclure les valeurs undefined
      else if (value !== undefined) {
        updateData[field] = value === '' ? null : value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      const warningMsg = 'Aucune donnée valide à mettre à jour';
      console.warn('[updateClientProfile] Avertissement:', warningMsg);
      return { data: null, error: { message: warningMsg } };
    }

    console.log('[updateClientProfile] Données à mettre à jour:', JSON.stringify(updateData, null, 2));
    
    // Vérification de la session utilisateur
    console.log('[updateClientProfile] Vérification de la session utilisateur...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      const errorMsg = 'Non authentifié. Veuillez vous reconnecter.';
      console.error('[updateClientProfile] Erreur de session:', {
        error: sessionError,
        sessionExists: !!session,
        userId: session?.user?.id
      });
      return { 
        data: null, 
        error: { 
          message: errorMsg, 
          details: sessionError || 'Aucune session active' 
        } 
      };
    }
    
    console.log('[updateClientProfile] Session utilisateur vérifiée:', {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.user_metadata?.role,
      isAuthenticated: true
    });
    
    // Exécution de la mise à jour
    console.log('[updateClientProfile] Exécution de la requête de mise à jour...');
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString() // Mise à jour automatique du champ updated_at
      })
      .eq('id', clientId)
      .select()
      .single(); // S'assure qu'une seule ligne est retournée

    if (error) {
      console.error('[updateClientProfile] Erreur lors de la mise à jour:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        timestamp: new Date().toISOString()
      });
      
      // Gestion spécifique des erreurs connues
      if (error.code === '42501') {
        console.error('[updateClientProfile] ERREUR DE PERMISSION RLS. Vérifiez que :');
        console.error('1. La politique RLS pour UPDATE est bien configurée sur la table profiles');
        console.error('2. L\'utilisateur a les droits nécessaires');
        console.error('3. La colonne updated_at existe dans la table profiles');
      }
      
      return { 
        data: null, 
        error: { 
          message: `Échec de la mise à jour: ${error.message}`,
          code: error.code,
          details: error
        } 
      };
    }

    console.log('[updateClientProfile] Succès! Profil mis à jour:', data);
    return { data, error: null };
    
  } catch (error) {
    // Créer un objet d'erreur détaillé
    const detailedError: DetailedError = {
      message: 'Erreur inconnue',
      timestamp: new Date().toISOString()
    };

    // Récupérer les informations d'erreur détaillées
    if (error instanceof Error) {
      detailedError.message = error.message;
      detailedError.stack = error.stack;
      
      // Si c'est une erreur de réseau
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        detailedError.message = 'Erreur de connexion au serveur. Vérifiez votre connexion Internet.';
        detailedError.code = 'NETWORK_ERROR';
      }
    } else if (typeof error === 'string') {
      detailedError.message = error;
    }

    // Ajouter les détails de la requête pour le débogage
    detailedError.details = {
      clientId,
      updates: Object.keys(updates || {}),
      timestamp: new Date().toISOString()
    };

    // Journaliser l'erreur complète
    console.error('[updateClientProfile] ERREUR DÉTAILLÉE:', JSON.stringify(detailedError, null, 2));
    
    // Retourner une réponse d'erreur claire
    return { 
      data: null, 
      error: { 
        message: `Échec de la mise à jour du profil: ${detailedError.message}`,
        code: detailedError.code || 'UNKNOWN_ERROR',
        details: detailedError.details,
        // Inclure la pile d'appels en développement uniquement
        ...(process.env.NODE_ENV === 'development' && { stack: detailedError.stack })
      } 
    };
  }
};
