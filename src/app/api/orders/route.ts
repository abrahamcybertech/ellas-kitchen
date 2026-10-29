import { NextRequest, NextResponse } from 'next/server';
import { createOrderWithValidation } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 20 order placements per hour per IP
    const rateCheck = checkRateLimit(`order_create_${ip}`, 20, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many order requests from this network. Please wait a few moments or contact our WhatsApp support.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validation
    if (!body.customer_name || typeof body.customer_name !== 'string' || body.customer_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Full customer name is required' }, { status: 400 });
    }

    if (!body.customer_phone || typeof body.customer_phone !== 'string' || body.customer_phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: 'Valid contact phone number is required' }, { status: 400 });
    }

    const fulfilment = body.fulfilment_type === 'pickup' ? 'pickup' : 'delivery';
    if (fulfilment === 'delivery' && (!body.delivery_address || body.delivery_address.trim().length < 5)) {
      return NextResponse.json({ success: false, error: 'Full delivery street address is required for doorstep delivery' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty. Please select delicious dishes to order.' }, { status: 400 });
    }

    const validPaymentMethods = ['paystack', 'bank_transfer', 'cash_on_delivery', 'cash_on_pickup'];
    const paymentMethod = validPaymentMethods.includes(body.payment_method) ? body.payment_method : 'bank_transfer';

    const result = createOrderWithValidation({
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      fulfilment_type: fulfilment,
      delivery_address: body.delivery_address,
      delivery_zone: body.delivery_zone,
      preferred_time: body.preferred_time,
      customer_notes: body.customer_notes,
      payment_method: paymentMethod,
      items: body.items,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          order: result.order,
          tracking_token: result.tracking_token,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unable to create order' }, { status: 400 });
  }
}
