import { NextRequest, NextResponse } from 'next/server';
import { getOrderByReferenceAndToken, recordPayment } from '@/lib/db';
import { initializePaystackTransaction, isPaystackConfigured } from '@/lib/payments/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_reference, tracking_token, email } = body;

    if (!order_reference || !tracking_token) {
      return NextResponse.json({ success: false, error: 'Order reference and tracking token are required' }, { status: 400 });
    }

    const order = getOrderByReferenceAndToken(order_reference, tracking_token);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found or invalid token' }, { status: 404 });
    }

    if (order.payment_status === 'paid' || order.payment_status === 'manually_verified') {
      return NextResponse.json({ success: false, error: 'Order is already paid' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const callbackUrl = `${proto}://${host}/track/${order.reference}?token=${tracking_token}&payment_status=verified`;

    // 1 NGN = 100 kobo
    const amountKobo = order.total_amount * 100;
    const customerEmail = email || order.customer_email || 'guest@ellaskitchen.ng';

    if (!isPaystackConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'PAYSTACK_NOT_CONFIGURED',
        message: 'Online payment is not configured yet. Add valid Paystack keys to the environment, or use Bank Transfer.',
        order: {
          reference: order.reference,
          total_amount: order.total_amount,
        },
      });
    }

    const paystackTx = await initializePaystackTransaction({
      email: customerEmail,
      amountKobo,
      reference: `${order.reference}_${Date.now()}`,
      callbackUrl,
      metadata: {
        order_id: order.id,
        order_reference: order.reference,
        customer_phone: order.customer_phone,
      },
    });

    if (paystackTx.error || !paystackTx.authorization_url) {
      return NextResponse.json(
        {
          success: false,
          error: paystackTx.error || 'Failed to initialize online payment',
        },
        { status: 400 }
      );
    }

    // Record pending payment attempt
    recordPayment({
      order_id: order.id,
      provider: 'paystack',
      reference: paystackTx.reference,
      amount: order.total_amount,
      status: 'pending',
      provider_metadata: { authorization_url: paystackTx.authorization_url },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackTx.authorization_url,
        reference: paystackTx.reference,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Payment initialization error' }, { status: 500 });
  }
}
