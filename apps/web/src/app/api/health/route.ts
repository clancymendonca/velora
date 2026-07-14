import { NextResponse } from 'next/server';

import { getServerEnv } from '@/server/env';
import { HealthResponseSchema } from '@/server/validators/health';

export async function GET() {
  const env = getServerEnv();

  const payload = HealthResponseSchema.parse({
    status: 'ok',
    service: 'web',
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    hasSupabaseUrl: Boolean(env.SUPABASE_URL),
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(payload);
}
