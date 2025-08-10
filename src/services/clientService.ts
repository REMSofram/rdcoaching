import { supabase } from '@/lib/supabase';
import type { TablesUpdate } from '@/types/database.types';

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
  sports_practiced?: string | string[];
  objectives?: string;
  injuries?: string | string[];
  created_at: string;
  updated_at: string;
}

export const fetchClients = async (): Promise<ClientProfile[]> => {
  try {
    console.log('Début de la récupération des profils clients depuis Supabase...');
    
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Utilisateur connecté:', user?.email);
    
    if (userError) {
      console.error('Erreur de récupération de l\'utilisateur:', userError);
      throw userError;
    }
    
    if (!user) {
      console.error('Aucun utilisateur connecté');
      return [];
    }
    
    // Récupérer uniquement les profils avec le rôle 'client' et exclure l'utilisateur connecté
    console.log('Récupération des profils clients...');
    const { data: profiles, error, status, statusText, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'client')  // Uniquement les clients
      .neq('id', user.id)    // Exclure l'utilisateur connecté
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

// Fonction pour formater la date au format YYYY-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface DailyLog {
  id: string;
  client_id: string;
  log_date: string;
  date: Date;
  status: 'completed' | 'pending' | 'missed';
  weight?: number;
  [key: string]: unknown; // Pour les autres propriétés optionnelles
}

// Interface pour le résultat de fetchClientLogs qui inclut le dernier poids
export interface ClientLogsResult extends Array<DailyLog> {
  lastWeight?: number;
}

export const fetchClientLogs = async (clientId: string): Promise<ClientLogsResult> => {
  try {
    // Récupérer les logs avec poids de l'historique complet
    const { data: allLogs, error: allLogsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: false });

    if (allLogsError) throw allLogsError;

    // Trouver le dernier poids non nul
    const lastWeightLog = allLogs?.find(log => log.weight && log.weight > 0);
    
    // Définir la date d'aujourd'hui à minuit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Créer un tableau pour les 3 derniers jours (aujourd'hui, hier, avant-hier)
    const lastThreeDays = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      lastThreeDays.push(date);
    }

    // Récupérer les logs pour ces 3 jours
    const { data: recentLogs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('client_id', clientId)
      .in('log_date', lastThreeDays.map(d => formatDate(d)))
      .order('log_date', { ascending: false });

    if (error) throw error;

    // Créer un map des logs par date pour un accès rapide
    const logsByDate = new Map(
      recentLogs.map(log => [log.log_date, log])
    );

    // Générer le statut pour chaque jour
    const result = lastThreeDays.map(date => {
      const dateStr = formatDate(date);
      const log = logsByDate.get(dateStr);
      const todayStr = formatDate(today);
      const isToday = dateStr === todayStr;

      if (log) {
        return {
          ...log,
          date: new Date(log.log_date),
          status: 'completed' as const,
          weight: log.weight || (lastWeightLog?.log_date === log.log_date ? lastWeightLog.weight : undefined)
        };
      } else if (isToday) {
        // Pour aujourd'hui, pas de log = en attente
        return {
          id: `pending-${dateStr}`,
          log_date: dateStr,
          date: new Date(dateStr),
          status: 'pending' as const,
          client_id: clientId,
          ...(lastWeightLog && { weight: lastWeightLog.weight })
        };
      } else {
        // Pour les jours précédents, pas de log = manqué
        return {
          id: `missed-${dateStr}`,
          log_date: dateStr,
          date: new Date(dateStr),
          status: 'missed' as const,
          client_id: clientId,
          ...(lastWeightLog && { weight: lastWeightLog.weight })
        };
      }
    });

    // Créer un objet résultat avec le dernier poids
    const resultWithLastWeight = result as ClientLogsResult;
    if (lastWeightLog) {
      resultWithLastWeight.lastWeight = lastWeightLog.weight;
    }

    return resultWithLastWeight;
  } catch (error) {
    console.error('Error fetching client logs:', error);
    return [];
  }
};

// Type pour les erreurs détaillées
type DetailedError = {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
  timestamp: string;
};

export const updateClientProfile = async (clientId: string, updates: TablesUpdate<'profiles'>) => {
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
    const updateData: Record<string, unknown> = {};
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
      else if ((field === 'sports_practiced' || field === 'injuries')) {
        if (value === null || value === undefined) {
          updateData[field] = [];
        } else if (typeof value === 'string') {
          // Si c'est une chaîne vide, mettre un tableau vide
          if (value.trim() === '') {
            updateData[field] = [];
          } else {
            // Sinon, séparer par des virgules et nettoyer les espaces
            updateData[field] = value.split(',').map((item: string) => item.trim());
          }
        } else if (Array.isArray(value)) {
          // Si c'est déjà un tableau, le garder tel quel
          updateData[field] = value;
        } else {
          // Pour tout autre type, essayer de convertir en chaîne
          try {
            const stringValue = String(value);
            updateData[field] = stringValue.trim() === '' ? [] : [stringValue.trim()];
          } catch (e) {
            console.warn(`[updateClientProfile] Impossible de convertir la valeur en tableau pour ${field}:`, value);
            updateData[field] = [];
          }
        }
      }
      // Gestion des champs numériques
      else if ((field === 'height' || field === 'starting_weight') && value !== undefined) {
        // Convertir en nombre ou null si vide
        if (value === '' || value === null) {
          updateData[field] = null;
        } else if (typeof value === 'string') {
          const numValue = parseFloat(value);
          updateData[field] = isNaN(numValue) ? null : numValue;
        } else if (typeof value === 'number') {
          updateData[field] = value;
        } else {
          updateData[field] = null;
        }
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
    
  } catch (error: unknown) {
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
