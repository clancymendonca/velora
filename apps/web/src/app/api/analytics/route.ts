import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsController } from '@velora/api';

const analyticsController = new AnalyticsController();
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(req: NextRequest) {
  const res = await analyticsController.getAnalytics(DEMO_USER_ID, req.nextUrl.pathname);
  return NextResponse.json(res.data, { status: res.status });
}
