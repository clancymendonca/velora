import { createClient } from '@supabase/supabase-js';

import { getServerEnv } from '@/server/env';

export function createSupabaseServerClient() {
  const env = getServerEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
