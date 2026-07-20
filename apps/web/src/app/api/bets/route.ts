import { NextRequest, NextResponse } from 'next/server';
import { BetController } from '@velora/api';

const betController = new BetController();
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = {
    status: searchParams.get('status') || undefined,
    limit: searchParams.get('limit') || '20',
    cursor: searchParams.get('cursor') || undefined,
  };

  const res = await betController.getBets(DEMO_USER_ID, queryParams, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await betController.placeBet(DEMO_USER_ID, body, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
