import crypto from 'crypto';
import { recordPayment, updateOrderPaymentStatus, getOrderByReferenceAndToken, getOrderById } from '@/lib/db';

const PAYSTACK_SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || '').trim();

export function isPaystackConfigured(): boolean {
  return Boolean(
    PAYSTACK_SECRET_KEY &&
      /^sk_(test|live)_/.test(PAYSTACK_SECRET_KEY) &&
      !PAYSTACK_SECRET_KEY.includes('replace_with')
  );
}

export async function initializePaystackTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: any;
}): Promise<{ authorization_url?: string; reference: string; error?: string }> {
  if (!isPaystackConfigured()) {
    return {
      reference: params.reference,
      error: 'PAYSTACK_NOT_CONFIGURED',
    };
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata || {},
      }),
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      return {
        reference: params.reference,
        error: data.message || 'Payment provider error during initialization',
      };
    }

    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (err: any) {
    return {
      reference: params.reference,
      error: err.message || 'Network error reaching payment provider',
    };
  }
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  success: boolean;
  amountKobo?: number;
  currency?: string;
  channel?: string;
  error?: string;
  raw?: any;
}> {
  if (!isPaystackConfigured()) {
    return {
      success: false,
      error: 'PAYSTACK_NOT_CONFIGURED',
    };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      return {
        success: false,
        error: data.message || 'Payment verification failed at provider',
      };
    }

    const tx = data.data;
    if (tx.status === 'success') {
      return {
        success: true,
        amountKobo: tx.amount,
        currency: tx.currency,
        channel: tx.channel,
        raw: tx,
      };
    }

    return {
      success: false,
      error: `Transaction status: ${tx.status}`,
      raw: tx,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error verifying transaction',
    };
  }
}

export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !PAYSTACK_SECRET_KEY) return false;

  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
