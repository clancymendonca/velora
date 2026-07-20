import { NextRequest, NextResponse } from 'next/server';
import { EventController } from '@velora/api';

const eventController = new EventController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const res = await eventController.getEventById(params.id, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
