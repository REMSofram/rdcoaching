import { supabase } from '@/lib/supabase';
import { 
  NutritionProgram, 
  CreateNutritionProgramInput, 
  UpdateNutritionProgramInput, 
  NutritionDay, 
  NutritionDayInput 
} from '@/types/Nutrition';

/**
 * Récupère le programme nutritionnel actif d'un client avec ses jours
 * @param clientId ID du client
 * @returns Le programme nutritionnel actif avec ses jours ou null si non trouvé
 */
export const getActiveNutritionProgram = async (clientId: string): Promise<NutritionProgram | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_active_nutrition_program_with_days', { client_id: clientId });

    if (error) {
      console.error('Error fetching active nutrition program:', error);
      throw error;
    }

    if (!data?.program) {
      return null;
    }

    // Convertir la réponse RPC en format attendu
    const program = {
      ...data.program,
      nutrition_days: data.days || []
    };

    // Trier les jours par ordre
    if (program.nutrition_days) {
      program.nutrition_days.sort((a: NutritionDay, b: NutritionDay) => a.day_order - b.day_order);
    }

    return program;
  } catch (error) {
    console.error('Error in getActiveNutritionProgram:', error);
    throw error;
  }
};

/**
 * Crée un nouveau programme nutritionnel pour un client avec ses jours
 * @param programData Les données du programme à créer
 * @returns Le programme créé avec ses jours
 */
export const createNutritionProgram = async (programData: CreateNutritionProgramInput): Promise<NutritionProgram> => {
  try {
    const { data, error } = await supabase.rpc('create_nutrition_program_with_days', {
      program_data: {
        client_id: programData.client_id,
        title: programData.title,
        is_active: true
      },
      days_data: programData.days.map(day => ({
        day_title: day.day_title,
        content: day.content,
        day_order: day.day_order
      }))
    });

    if (error) {
      console.error('Error creating nutrition program with days:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createNutritionProgram:', error);
    throw error;
  }
};

/**
 * Met à jour un programme nutritionnel existant et ses jours
 * @param programId ID du programme à mettre à jour
 * @param updates Les champs à mettre à jour
 * @returns Le programme mis à jour avec ses jours
 */
export const updateNutritionProgram = async (
  programId: string,
  updates: UpdateNutritionProgramInput
): Promise<NutritionProgram> => {
  try {
    // Préparer les mises à jour du programme
    const { days, ...programUpdates } = updates;

    // Si des jours sont fournis, on utilise la fonction RPC
    if (updates.days) {
      const { data, error } = await supabase.rpc('update_nutrition_program_with_days', {
        program_id: programId,
        program_data: {
          title: updates.title || undefined,
          is_active: updates.is_active
        },
        days_data: updates.days.map((day, idx) => ({
          id: 'id' in day ? day.id : undefined,
          day_title: day.day_title,
          content: day.content,
          day_order: idx + 1
        }))
      });

      if (error) {
        console.error('Error updating nutrition program with days:', error);
        throw error;
      }

      return data;
    } 
    // Sinon, simple mise à jour du programme
    else {
      const { data, error } = await supabase
        .from('nutrition_programs')
        .update(programUpdates)
        .eq('id', programId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating nutrition program:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in updateNutritionProgram:', error);
    throw error;
  }
};

/**
 * Supprime un programme nutritionnel et tous ses jours associés
 * @param programId ID du programme à supprimer
 * @returns Un objet contenant le statut de la suppression et un message
 */
export const deleteNutritionProgram = async (programId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('delete_nutrition_program_with_days', {
      p_program_id: programId
    });

    if (error) {
      console.error('Erreur lors de la suppression du programme nutritionnel:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la suppression du programme' 
      };
    }

    // Si data est déjà un objet avec une propriété success
    if (data && typeof data === 'object' && 'success' in data) {
      return data as { success: boolean; message?: string; error?: string };
    }

    return { 
      success: true, 
      message: 'Programme nutritionnel supprimé avec succès' 
    };
  } catch (err) {
    console.error('Erreur inattendue lors de la suppression:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Une erreur inattendue est survenue' 
    };
  }
};

/**
 * Récupère un jour de programme nutritionnel spécifique
 * @param dayId ID du jour à récupérer
 * @returns Le jour de programme nutritionnel ou null si non trouvé
 */
export const getNutritionDay = async (dayId: string): Promise<NutritionDay | null> => {
  const { data, error } = await supabase
    .from('nutrition_days')
    .select('*')
    .eq('id', dayId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching nutrition day:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un jour de programme nutritionnel existant
 * @param dayId ID du jour à mettre à jour
 * @param updates Les champs à mettre à jour
 * @returns Le jour mis à jour
 */
export const updateNutritionDay = async (
  dayId: string,
  updates: Partial<NutritionDayInput>
): Promise<NutritionDay> => {
  const { data, error } = await supabase
    .from('nutrition_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) {
    console.error('Error updating nutrition day:', error);
    throw error;
  }

  return data;
};

/**
 * Supprime un jour de programme nutritionnel
 * @param dayId ID du jour à supprimer
 */
export const deleteNutritionDay = async (dayId: string): Promise<void> => {
  const { error } = await supabase
    .from('nutrition_days')
    .delete()
    .eq('id', dayId);

  if (error) {
    console.error('Error deleting nutrition day:', error);
    throw error;
  }
};

/**
 * Récupère tous les programmes nutritionnels (pour les coachs)
 * @returns La liste de tous les programmes nutritionnels
 */
export const getAllNutritionPrograms = async (): Promise<NutritionProgram[]> => {
  const { data, error } = await supabase
    .from('nutrition_programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all nutrition programs:', error);
    throw error;
  }

  return data;
};

/**
 * Récupère tous les programmes nutritionnels d'un client spécifique (pour les coachs)
 * @param clientId ID du client
 * @returns La liste des programmes nutritionnels du client
 */
export const getClientNutritionPrograms = async (clientId: string): Promise<NutritionProgram[]> => {
  const { data, error } = await supabase
    .from('nutrition_programs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client nutrition programs:', error);
    throw error;
  }

  return data;
};
