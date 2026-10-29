import { NextRequest, NextResponse } from 'next/server';
import { getOrderByReferenceAndToken, getOrderByReferenceAndPhone } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Anti-enumeration rate limit: 30 attempts per minute
    const rateCheck = checkRateLimit(`order_track_${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Too many lookup attempts. Please try again in one minute.' }, { status: 429 });
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get('ref')?.trim().toUpperCase();
    const token = url.searchParams.get('token')?.trim();
    const phone = url.searchParams.get('phone')?.trim();

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Order reference is required' }, { status: 400 });
    }

    let order = null;

    if (token) {
      order = getOrderByReferenceAndToken(reference, token);
    } else if (phone && phone.length >= 7) {
      order = getOrderByReferenceAndPhone(reference, phone);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either the secure tracking link token or your registered phone number to verify this order.',
        },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found. Please verify your reference and credentials.' }, { status: 404 });
    }

    // Return sanitized customer tracking view (do not expose internal tracking_token in response)
    const sanitizedOrder = {
      reference: order.reference,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      fulfilment_type: order.fulfilment_type,
      delivery_address: order.delivery_address,
      delivery_zone: order.delivery_zone,
      preferred_time: order.preferred_time,
      customer_notes: order.customer_notes,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      discount_amount: order.discount_amount,
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      created_at: order.created_at,
      items: order.items,
      status_history: order.status_history,
    };

    return NextResponse.json({ success: true, data: sanitizedOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve order tracking details' }, { status: 500 });
  }
}
