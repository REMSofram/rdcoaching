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
