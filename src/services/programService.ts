import { supabase } from '@/lib/supabase';
import { Program, CreateProgramInput, UpdateProgramInput, ProgramDay, ProgramDayInput } from '@/types/Program';

/**
 * Récupère le programme actif d'un client avec ses jours
 * @param clientId ID du client
 * @returns Le programme actif avec ses jours ou null si non trouvé
 */
export const getActiveProgram = async (clientId: string): Promise<Program | null> => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      program_days (*)
    `)
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching active program:', error);
    throw error;
  }

  // Trier les jours par ordre
  if (data?.program_days) {
    data.program_days.sort((a: ProgramDay, b: ProgramDay) => a.day_order - b.day_order);
  }

  return data;
};

/**
 * Crée un nouveau programme pour un client avec ses jours
 * @param programData Les données du programme à créer
 * @returns Le programme créé avec ses jours
 */
export const createProgram = async (programData: CreateProgramInput): Promise<Program> => {
  // Désactiver tout autre programme actif pour ce client
  await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('client_id', programData.client_id)
    .eq('is_active', true);

  // Commencer une transaction
  const { data, error } = await supabase.rpc('create_program_with_days', {
    program_data: {
      client_id: programData.client_id,
      title: programData.title,
      is_active: true
    },
    days_data: programData.days
  });

  if (error) {
    console.error('Error creating program with days:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un programme existant et ses jours
 * @param programId ID du programme à mettre à jour
 * @param updates Les champs à mettre à jour
 * @returns Le programme mis à jour avec ses jours
 */
export const updateProgram = async (
  programId: string,
  updates: UpdateProgramInput
): Promise<Program> => {
  // Mettre à jour les informations de base du programme
  const programUpdates = { ...updates };
  delete programUpdates.days;

  // Si des jours sont fournis, on utilise une transaction RPC
  if (updates.days) {
    // S'assurer que days_data est bien un tableau JSON
    const daysArray = Array.isArray(updates.days) ? updates.days : [updates.days];
    
    // L'ordre et le type des paramètres doivent correspondre exactement à la définition de la fonction PostgreSQL
    const { data, error } = await supabase.rpc('update_program_with_days', {
      program_id_param: programId,
      program_data: programUpdates,
      days_data: daysArray
    });

    if (error) {
      console.error('Error updating program with days:', error);
      throw error;
    }

    return data;
  } 
  // Sinon, simple mise à jour du programme
  else {
    const { data, error } = await supabase
      .from('programs')
      .update(programUpdates)
      .eq('id', programId)
      .select(`
        *,
        program_days (*)
      `)
      .single();

    if (error) {
      console.error('Error updating program:', error);
      throw error;
    }

    return data;
  }
};

/**
 * Supprime un programme et tous ses jours associés
 * @param programId ID du programme à supprimer
 */
export const deleteProgram = async (programId: string): Promise<void> => {
  // La suppression en cascade est gérée par la base de données
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
 * Récupère un jour de programme spécifique
 * @param dayId ID du jour à récupérer
 * @returns Le jour de programme ou null si non trouvé
 */
export const getProgramDay = async (dayId: string): Promise<ProgramDay | null> => {
  const { data, error } = await supabase
    .from('program_days')
    .select('*')
    .eq('id', dayId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching program day:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un jour de programme existant
 * @param dayId ID du jour à mettre à jour
 * @param updates Les champs à mettre à jour
 * @returns Le jour mis à jour
 */
export const updateProgramDay = async (
  dayId: string,
  updates: Partial<ProgramDayInput>
): Promise<ProgramDay> => {
  const { data, error } = await supabase
    .from('program_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) {
    console.error('Error updating program day:', error);
    throw error;
  }

  return data;
};

/**
 * Supprime un jour de programme
 * @param dayId ID du jour à supprimer
 */
export const deleteProgramDay = async (dayId: string): Promise<void> => {
  const { error } = await supabase
    .from('program_days')
    .delete()
    .eq('id', dayId);

  if (error) {
    console.error('Error deleting program day:', error);
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
