import { Profile } from './Profile';

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5; // Échelle de 1 à 5
  sleep_hours?: number;
  notes?: string;
  water_intake_glasses?: number;
  workouts?: {
    type: string;
    duration_minutes: number;
    intensity: 'low' | 'moderate' | 'high';
  }[];
  meals?: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    calories?: number;
  }[];
  created_at: string;
  updated_at: string;
  // Relations
  profile?: Profile;
}
