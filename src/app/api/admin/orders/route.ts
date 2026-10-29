import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Staff order permission required' }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = (url.searchParams.get('status') as OrderStatus) || undefined;
    const paymentStatus = (url.searchParams.get('payment_status') as PaymentStatus) || undefined;
    const paymentMethod = (url.searchParams.get('payment_method') as PaymentMethod) || undefined;
    const search = url.searchParams.get('search') || undefined;
    const dateFrom = url.searchParams.get('date_from') || undefined;
    const dateTo = url.searchParams.get('date_to') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const result = getOrders({
      status,
      paymentStatus,
      paymentMethod,
      search,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result.orders, total: result.totalCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
