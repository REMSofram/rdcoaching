export interface ClientData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  height?: number;
  starting_weight?: number;
  sports_practiced?: string;
  objectives?: string;
  injuries?: string;
  created_at: string;
  updated_at: string;
}

export interface LogData {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  lastWeight?: number;
}

export interface ProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  avatar_url?: string | null;
  bio?: string | null;
  goals?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Interface pour le type d'erreur retourné par updateClientProfile
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}
