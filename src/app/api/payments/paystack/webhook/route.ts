import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackWebhookSignature } from '@/lib/payments/paystack';
import { getPaymentByReference, recordPayment, updateOrderPaymentStatus, getOrderById } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ success: false, error: 'Invalid HMAC webhook signature' }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const event = payload.event;
    const data = payload.data;

    // We process charge.success
    if (event === 'charge.success' && data) {
      const reference = data.reference;
      const orderId = data.metadata?.order_id;

      if (!reference || !orderId) {
        return NextResponse.json({ success: true, message: 'Webhook received but missing required identifiers' });
      }

      // Idempotency check: if payment already successfully recorded, acknowledge without duplicate processing
      const existingPayment: any = getPaymentByReference(reference);
      if (existingPayment && existingPayment.status === 'paid') {
        return NextResponse.json({ success: true, message: 'Event already processed' });
      }

      const order = getOrderById(orderId);
      if (!order) {
        return NextResponse.json({ success: true, message: 'Order reference not found' });
      }

      // Verify amount (Paystack amount is in kobo)
      const expectedKobo = order.total_amount * 100;
      if (data.amount >= expectedKobo) {
        recordPayment({
          order_id: order.id,
          provider: 'paystack',
          reference: reference,
          amount: Math.round(data.amount / 100),
          status: 'paid',
          provider_metadata: data,
        });

        updateOrderPaymentStatus(order.id, 'paid', data);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Webhook processing exception' }, { status: 500 });
  }
}
