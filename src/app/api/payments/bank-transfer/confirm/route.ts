import { NextRequest, NextResponse } from 'next/server';
import { getOrderByReferenceAndToken, getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, token, sender_name, bank_name, payment_notes } = body;

    if (!reference || !token) {
      return NextResponse.json({ success: false, error: 'Order reference and tracking token are required' }, { status: 400 });
    }

    const order = getOrderByReferenceAndToken(reference, token);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const db = getDb();
    const note = `Customer confirmed bank transfer. Sender: ${sender_name || 'Not specified'}. Bank: ${bank_name || 'Not specified'}. Notes: ${payment_notes || 'None'}`;

    db.prepare(`
      INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at)
      VALUES (?, ?, ?, ?, 'Customer', datetime('now'))
    `).run('osh_' + crypto.randomUUID().slice(0, 8), order.id, order.status, note);

    return NextResponse.json({
      success: true,
      message: 'Bank transfer confirmation recorded. Our team will verify and begin preparing your meal shortly.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Unable to record transfer confirmation' }, { status: 500 });
  }
}
