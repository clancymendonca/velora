import { NextRequest, NextResponse } from 'next/server';
import { BetController } from '@velora/api';
import { createSupabaseServerClient } from '@/server/supabase/client';

const betController = new BetController();

/**
 * Helper to extract user ID from Supabase JWT token.
 * Falls back to a mock UUID for development testing when no header is present.
 */
async function authenticateUser(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    // For development convenience, fallback to mock ID if not provided
    return '00000000-0000-0000-0000-000000000000';
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const supabase = createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user.id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateUser(request);
    const { searchParams } = new URL(request.url);
    const query = {
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
      status: searchParams.get('status'),
    };

    const response = await betController.getBets(userId, query, '/api/v1/bets');
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          type: 'https://api.velora.com/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Valid authentication credentials are required.',
          instance: '/api/v1/bets',
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        type: 'https://api.velora.com/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
        instance: '/api/v1/bets',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateUser(request);
    const body = await request.json();

    const response = await betController.placeBet(userId, body, '/api/v1/bets');
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          type: 'https://api.velora.com/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Valid authentication credentials are required.',
          instance: '/api/v1/bets',
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        type: 'https://api.velora.com/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
        instance: '/api/v1/bets',
      },
      { status: 500 }
    );
  }
}
