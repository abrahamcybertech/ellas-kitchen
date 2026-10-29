import { NextRequest, NextResponse } from 'next/server';
import { getPaymentByReference, recordPayment, updateOrderPaymentStatus, getOrderById } from '@/lib/db';
import { verifyPaystackTransaction, isPaystackConfigured } from '@/lib/payments/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Transaction reference is required' }, { status: 400 });
    }

    if (!isPaystackConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'PAYSTACK_NOT_CONFIGURED',
          message: 'Online payment is not configured yet. Add valid Paystack keys to the environment.',
        },
        { status: 400 }
      );
    }

    const verification = await verifyPaystackTransaction(reference);
    if (!verification.success || !verification.raw) {
      return NextResponse.json({ success: false, error: verification.error || 'Payment verification failed' }, { status: 400 });
    }

    const tx = verification.raw;
    const orderId = tx.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order reference metadata not found on transaction' }, { status: 400 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify amount matches (tx.amount is in kobo)
    const expectedKobo = order.total_amount * 100;
    if (tx.amount < expectedKobo) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment underpaid: expected ₦${order.total_amount.toLocaleString()} but received ₦${(tx.amount / 100).toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    // Record verified payment
    recordPayment({
      order_id: order.id,
      provider: 'paystack',
      reference: reference,
      amount: Math.round(tx.amount / 100),
      status: 'paid',
      provider_metadata: tx,
    });

    // Update order payment status
    const updatedOrder = updateOrderPaymentStatus(order.id, 'paid', tx);

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        payment_reference: reference,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
