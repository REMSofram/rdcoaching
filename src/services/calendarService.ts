import { supabase } from '@/lib/supabase';

export interface CalendarCard {
  id?: string;
  client_id: string;
  title: string;
  description?: string;
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarCardWithInfo extends CalendarCard {
  duration?: string;
  client_name?: string;
  status?: 'upcoming' | 'current' | 'past';
}

/**
 * Crée une nouvelle carte de calendrier
 */
export const createCalendarCard = async (cardData: Omit<CalendarCard, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
  try {
    const { data, error } = await supabase
      .from('calendar_cards')
      .insert([cardData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating calendar card:', error);
    return { data: null, error };
  }
};

/**
 * Récupère une carte de calendrier par son ID
 */
export const getCalendarCardById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('calendar_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching calendar card:', error);
    return { data: null, error };
  }
};

/**
 * Met à jour une carte de calendrier
 */
export const updateCalendarCard = async (id: string, updates: Partial<CalendarCard>) => {
  try {
    const { data, error } = await supabase
      .from('calendar_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating calendar card:', error);
    return { data: null, error };
  }
};

/**
 * Supprime une carte de calendrier
 */
export const deleteCalendarCard = async (id: string) => {
  try {
    const { error } = await supabase
      .from('calendar_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting calendar card:', error);
    return { error };
  }
};

/**
 * Récupère toutes les cartes d'un client
 */
export const getClientCalendarCards = async (clientId: string) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }

    // Vérifier que l'utilisateur a le droit de voir ces cartes
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('Profil utilisateur non trouvé');
    }

    // Un client ne peut voir que ses propres cartes
    if (profile.role === 'client' && clientId !== userId) {
      throw new Error('Non autorisé à voir ces cartes');
    }

    const { data, error } = await supabase
      .from('calendar_cards')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client calendar cards:', error);
    return { data: null, error };
  }
};

/**
 * Récupère les cartes de calendrier avec des informations supplémentaires (vue enrichie)
 */
export const getCalendarCardsWithInfo = async (clientId?: string) => {
  try {
    // Si clientId n'est pas fourni, on utilise l'ID de l'utilisateur connecté
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }

    let query = supabase
      .from('calendar_cards_with_info')
      .select('*');

    // Si on est un client, on ne peut voir que nos propres cartes
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('Profil utilisateur non trouvé');
    }

    if (profile.role === 'client') {
      query = query.eq('client_id', userId);
    } 
    // Si un clientId est spécifié et que l'utilisateur est un coach
    else if (clientId) {
      query = query.eq('client_id', clientId);
    }
    // Si pas de clientId et utilisateur est un coach, on laisse passer pour voir toutes les cartes

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) throw error;
    return { data: data as CalendarCardWithInfo[], error: null };
  } catch (error) {
    console.error('Error fetching calendar cards with info:', error);
    return { data: null, error };
  }
};

/**
 * Fonction obsolète - conservée pour la rétrocompatibilité
 * @deprecated La progression n'est plus gérée dans les cartes de calendrier
 */
export const updateCardProgress = async (id: string, _progress: number) => {
  console.warn('La fonction updateCardProgress est obsolète et ne fait plus rien');
  return { data: null, error: null };
};

/**
 * Récupère les cartes à venir (prochaines 2 semaines)
 */
export const getUpcomingCards = async (clientId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    const twoWeeksLaterStr = twoWeeksLater.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('calendar_cards')
      .select('*')
      .eq('client_id', clientId)
      .gte('start_date', today)
      .lte('start_date', twoWeeksLaterStr)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching upcoming cards:', error);
    return { data: null, error };
  }
};
