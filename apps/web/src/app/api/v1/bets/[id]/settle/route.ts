import { NextRequest, NextResponse } from 'next/server';
import { BetController } from '@velora/api';

const betController = new BetController();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await betController.settleBet(id, body, `/api/v1/bets/${id}/settle`);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        type: 'https://api.velora.com/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: message,
        instance: `/api/v1/bets`,
      },
      { status: 500 }
    );
  }
}
