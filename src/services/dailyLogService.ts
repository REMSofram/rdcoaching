import { supabase } from '@/lib/supabase';

export interface DailyLog {
  id?: string;
  client_id: string;
  weight?: number;
  energy_level?: number; // 1-5
  sleep_hours?: number;
  sleep_quality?: number; // 1-5
  appetite?: 'faible' | 'moyen' | 'élevé';
  notes?: string;
  created_at?: string;
  log_date: string; // Format: YYYY-MM-DD
  training_done?: boolean;
  training_type?: string;
  plaisir_seance?: number; // 1-5
  updated_at?: string;
}

export const createDailyLog = async (logData: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .insert([logData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating daily log:', error);
    return { data: null, error };
  }
};

export const getTodaysLog = async (clientId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('client_id', clientId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching today\'s log:', error);
    return { data: null, error };
  }
};

export const updateDailyLog = async (id: string, updates: Partial<DailyLog>) => {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating daily log:', error);
    return { data: null, error };
  }
};

export const getClientLogs = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client logs:', error);
    return { data: null, error };
  }
};
