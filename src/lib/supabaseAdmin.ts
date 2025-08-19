import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy, safe initializer to avoid throwing at module import time.
let cachedAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): { client: SupabaseClient | null; error?: string } {
  if (cachedAdmin) return { client: cachedAdmin };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  // Prefer secure server-only var; fallback to legacy name if used in project
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) as string | undefined;

  if (!supabaseUrl) {
    return { client: null, error: 'Env NEXT_PUBLIC_SUPABASE_URL manquante' };
  }
  if (!serviceRoleKey) {
    return { client: null, error: 'Env SUPABASE_SERVICE_ROLE_KEY manquante (ou NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)' };
  }

  cachedAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return { client: cachedAdmin };
}
