export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
  role?: 'client' | 'coach';
}
