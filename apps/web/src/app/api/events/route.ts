import { NextRequest, NextResponse } from 'next/server';
import { EventController } from '@velora/api';

const eventController = new EventController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryParams = {
    sport: searchParams.get('sport') || undefined,
    status: searchParams.get('status') || undefined,
    limit: searchParams.get('limit') || '20',
    cursor: searchParams.get('cursor') || undefined,
  };

  const res = await eventController.getEvents(queryParams, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
