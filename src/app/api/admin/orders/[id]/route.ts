import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, updateOrderPaymentStatus, logAuditEvent } from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/security/auth';
import { OrderStatus, PaymentStatus } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Staff order permission required' }, { status: 403 });
    }

    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Error fetching order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session.role, 'orders')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Staff order permission required' }, { status: 403 });
    }

    const body = await req.json();
    let updatedOrder = null;

    if (body.status) {
      updatedOrder = updateOrderStatus(params.id, body.status as OrderStatus, body.note, session.name || session.email);

      logAuditEvent({
        userId: session.userId,
        userEmail: session.email,
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'order',
        entityId: params.id,
        details: { new_status: body.status, note: body.note },
      });
    }

    if (body.payment_status) {
      updatedOrder = updateOrderPaymentStatus(params.id, body.payment_status as PaymentStatus);

      logAuditEvent({
        userId: session.userId,
        userEmail: session.email,
        action: 'UPDATE_PAYMENT_STATUS',
        entityType: 'order',
        entityId: params.id,
        details: { new_payment_status: body.payment_status },
      });
    }

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found or no changes applied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
