import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';

type Note = Tables<'coach_notes'>;

export const noteService = {
  // Récupérer ou créer la note d'un client
  async getOrCreateClientNote(clientId: string): Promise<Note> {
    // Récupérer l'ID de l'utilisateur connecté (le coach)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Essayer de créer une nouvelle note
      const { data: newNote, error: createError } = await supabase
        .from('coach_notes')
        .insert([{
          client_id: clientId,
          coach_id: user.id,
          content: ''
        }])
        .select()
        .single();

      if (!createError) {
        return newNote;
      }

      // Si l'erreur n'est pas une violation de contrainte d'unicité, la propager
      if (createError.code !== '23505') {
        throw createError;
      }
    } catch (error) {
      // Vérifier le type de l'erreur
      if (error && typeof error === 'object' && 'code' in error) {
        // Ignorer l'erreur de contrainte d'unicité, cela signifie que la note existe déjà
        if (error.code !== '23505') {
          console.error('Error in getOrCreateClientNote:', error);
          throw error;
        }
      } else {
        console.error('Unexpected error in getOrCreateClientNote:', error);
        throw error;
      }
    }

    // Si on arrive ici, c'est que la note existe déjà, on la récupère
    const { data: existingNote, error: fetchError } = await supabase
      .from('coach_notes')
      .select('*')
      .eq('client_id', clientId)
      .eq('coach_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing note:', fetchError);
      throw fetchError;
    }

    if (!existingNote) {
      throw new Error('Impossible de récupérer la note existante');
    }

    return existingNote;
  },

  // Mettre à jour le contenu de la note
  async updateNoteContent(clientId: string, content: string): Promise<Note> {
    // Récupérer l'ID de l'utilisateur connecté (le coach)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const { data, error } = await supabase
      .from('coach_notes')
      .update({ content })
      .eq('client_id', clientId)
      .eq('coach_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return data;
  }
};

export default noteService;
