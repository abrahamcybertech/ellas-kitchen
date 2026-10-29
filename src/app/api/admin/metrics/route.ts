import { NextRequest, NextResponse } from 'next/server';
import { getOrderMetrics } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/security/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const rangeDays = parseInt(url.searchParams.get('days') || '30', 10);

    const metrics = getOrderMetrics(rangeDays);
    return NextResponse.json({ success: true, data: metrics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to compute business metrics' }, { status: 500 });
  }
}
