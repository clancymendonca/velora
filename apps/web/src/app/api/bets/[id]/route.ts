import { NextRequest, NextResponse } from 'next/server';
import { BetController } from '@velora/api';

const betController = new BetController();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const res = await betController.getBetById(params.id, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();
  const res = await betController.settleBet(params.id, body, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const res = await betController.deleteBet(params.id, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
