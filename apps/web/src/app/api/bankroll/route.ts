import { NextRequest, NextResponse } from 'next/server';
import { BankrollController } from '@velora/api';

const bankrollController = new BankrollController();
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(req: NextRequest) {
  const res = await bankrollController.getBankroll(DEMO_USER_ID, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const res = await bankrollController.updateBankroll(DEMO_USER_ID, body, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
