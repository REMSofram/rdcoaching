export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  avatar_url?: string;
  bio?: string;
  goals?: string[];
  created_at: string;
  updated_at: string;
}
