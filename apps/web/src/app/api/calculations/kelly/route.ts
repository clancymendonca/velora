import { NextRequest, NextResponse } from 'next/server';
import { CalculationController } from '@velora/api';

const calcController = new CalculationController();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await calcController.calculateKelly(body, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
