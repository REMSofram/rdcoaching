// Export all types
export * from './User';
export * from './Profile';
export * from './DailyLog';
export * from './Program';
export * from './Nutrition';
export * from './Calendar';

// Types de base
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Utilitaires
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};
