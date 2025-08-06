import { supabase } from '@/lib/supabase';
import { Program, CreateProgramInput, UpdateProgramInput } from '@/types/Program';

/**
 * Récupère le programme actif d'un client
 * @param clientId ID du client
 * @returns Le programme actif ou null si aucun programme n'est trouvé
 */
export const getActiveProgram = async (clientId: string): Promise<Program | null> => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching active program:', error);
    throw error;
  }

  return data;
};

/**
 * Crée un nouveau programme pour un client
 * @param programData Les données du programme à créer
 * @returns Le programme créé
 */
export const createProgram = async (programData: CreateProgramInput): Promise<Program> => {
  // Désactiver tout autre programme actif pour ce client
  await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('client_id', programData.client_id)
    .eq('is_active', true);

  // Créer le nouveau programme
  const { data, error } = await supabase
    .from('programs')
    .insert([
      {
        ...programData,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un programme existant
 * @param programId ID du programme à mettre à jour
 * @param updates Les champs à mettre à jour
 * @returns Le programme mis à jour
 */
export const updateProgram = async (
  programId: string,
  updates: UpdateProgramInput
): Promise<Program> => {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select()
    .single();

  if (error) {
    console.error('Error updating program:', error);
    throw error;
  }

  return data;
};

/**
 * Supprime un programme
 * @param programId ID du programme à supprimer
 */
export const deleteProgram = async (programId: string): Promise<void> => {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId);

  if (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

/**
 * Récupère tous les programmes (pour les coachs)
 * @returns La liste de tous les programmes
 */
export const getAllPrograms = async (): Promise<Program[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all programs:', error);
    throw error;
  }

  return data;
};

/**
 * Récupère tous les programmes d'un client spécifique (pour les coachs)
 * @param clientId ID du client
 * @returns La liste des programmes du client
 */
export const getClientPrograms = async (clientId: string): Promise<Program[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client programs:', error);
    throw error;
  }

  return data;
};
