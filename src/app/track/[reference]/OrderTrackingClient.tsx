'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  Store,
  Printer,
  MessageCircle,
  Building,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface OrderTrackingClientProps {
  reference: string;
  token?: string;
  initialOrder: Order | null;
}

export default function OrderTrackingClient({
  reference,
  token,
  initialOrder,
}: OrderTrackingClientProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [phoneVerification, setPhoneVerification] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Bank transfer confirmation modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);

  // Paystack online retry state
  const [isInitializingPaystack, setIsInitializingPaystack] = useState(false);
  const [paystackError, setPaystackError] = useState<string | null>(null);

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(reference)}&phone=${encodeURIComponent(phoneVerification)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check your phone number.');
      }
      setOrder(data.data);
    } catch (err: any) {
      setVerifyError(err.message || 'Unable to retrieve order');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token && !order) return;
    setIsConfirmingTransfer(true);

    try {
      const res = await fetch('/api/payments/bank-transfer/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          token: token || 'verified_session',
          sender_name: senderName,
          bank_name: bankName,
          payment_notes: transferNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit transfer confirmation');
      }

      setTransferSuccessMessage(data.message || 'Transfer confirmed. Awaiting kitchen review.');
      setTimeout(() => setShowTransferModal(false), 2000);
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setIsConfirmingTransfer(false);
    }
  };

  const handlePayOnlineWithPaystack = async () => {
    if (!token) {
      setPaystackError('Direct secure token required for online payment gateway session');
      return;
    }
    setIsInitializingPaystack(true);
    setPaystackError(null);

    try {
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_reference: reference,
          tracking_token: token,
          email: order?.customer_email,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || 'Payment gateway initialization failed');
      }

      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Payment gateway did not return a checkout link');
      }
    } catch (err: any) {
      setPaystackError(
        err instanceof TypeError
          ? 'Unable to reach the payment server. Please check your connection and try again.'
          : err.message || 'Unable to start online payment'
      );
      setIsInitializingPaystack(false);
    }
  };

  // If order is not loaded because no valid token was provided in URL
  if (!order) {
    return (
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 sm:p-12 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400 mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-cream-50">
            Secure Order Verification
          </h2>
          <p className="text-xs text-brand-brown-300 mt-2">
            To protect your privacy and order details, please enter the contact phone number associated with order <span className="font-mono font-bold text-brand-gold-400">{reference}</span>.
          </p>
        </div>

        {verifyError && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{verifyError}</span>
          </div>
        )}

        <form onSubmit={handleVerifyPhone} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-cream-200">
              Customer Phone Number
            </label>
            <input
              type="tel"
              required
              value={phoneVerification}
              onChange={(e) => setPhoneVerification(e.target.value)}
              placeholder="Example: 0803 123 4567"
              className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 disabled:opacity-50 text-brand-dark-950 font-bold text-sm shadow-gold-glow transition"
          >
            {isVerifying ? 'Verifying...' : 'View Order Tracking'}
          </button>
        </form>
      </div>
    );
  }

  // Define steps
  const steps: Array<{ key: OrderStatus; label: string; desc: string }> = [
    { key: 'pending_confirmation', label: 'Order Received', desc: 'Awaiting kitchen review' },
    { key: 'confirmed', label: 'Order Confirmed', desc: 'Ingredients prepared' },
    { key: 'preparing', label: 'In the Kitchen', desc: 'Simmering and frying fresh' },
    {
      key: order.fulfilment_type === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup',
      label: order.fulfilment_type === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
      desc: order.fulfilment_type === 'delivery' ? 'On the way to your doorstep' : 'Ready at Nyanya counter',
    },
    { key: 'completed', label: 'Completed', desc: 'Delivered and enjoyed' },
  ];

  const currentStepIndex = (() => {
    if (order.status === 'pending_confirmation') return 0;
    if (order.status === 'confirmed') return 1;
    if (order.status === 'preparing') return 2;
    if (order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') return 3;
    if (order.status === 'completed') return 4;
    return 0;
  })();

  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-8">
      {/* Top Reference Card */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 text-brand-gold-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Order Successfully Recorded</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-brand-cream-50">
            Order Reference: <span className="text-brand-gold-400 font-mono">{order.reference}</span>
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-NG')} for {order.customer_name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-brand-brown-900 border border-brand-brown-700 hover:border-brand-gold-500 text-brand-cream-100 text-xs font-bold flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-brand-gold-400" />
            <span>Print Receipt</span>
          </button>

          <a
            href={`https://wa.me/2348080058907?text=Hello%20Ella%27s%20Kitchen,%20I%20am%20tracking%20my%20order%20${order.reference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold flex items-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Kitchen</span>
          </a>
        </div>
      </div>

      {/* Preparation Progress Bar */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8">
        <h2 className="font-serif text-xl font-bold text-brand-cream-50 mb-6">
          Live Kitchen Tracking
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
            This order was cancelled. If you believe this is in error, please contact our support team.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={st.key}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                    isCurrent
                      ? 'border-brand-gold-500 bg-brand-gold-500/10 shadow-gold-glow'
                      : isPast
                      ? 'border-brand-brown-800 bg-brand-dark-950/80 text-brand-cream-300'
                      : 'border-brand-brown-900/60 bg-brand-dark-950/30 text-brand-brown-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold-400">
                      Step {idx + 1}
                    </span>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-brand-gold-500" />}
                    {isCurrent && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-gold-400 animate-ping" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-brand-cream-50 leading-snug">
                      {st.label}
                    </h3>
                    <p className="text-[11px] text-brand-brown-300 mt-1 leading-normal">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Status & Action Card */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-brown-800 pb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-brand-gold-400 font-bold block mb-1">
              Payment Status
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.payment_status === 'paid' || order.payment_status === 'manually_verified'
                    ? 'bg-green-900/80 text-green-300 border border-green-700'
                    : order.payment_status === 'pending'
                    ? 'bg-yellow-900/80 text-yellow-300 border border-yellow-700'
                    : 'bg-red-900/80 text-red-300 border border-red-700'
                }`}
              >
                {order.payment_status === 'manually_verified' ? 'Verified by Kitchen' : order.payment_status}
              </span>
              <span className="text-sm font-semibold text-brand-cream-200 capitalize">
                Method: {order.payment_method.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-brand-brown-300 block">Total Amount</span>
            <span className="font-serif text-2xl font-bold text-brand-gold-400">
              ₦{order.total_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action button if pending */}
        {order.payment_status === 'pending' && (
          <div className="pt-6 space-y-4">
            {order.payment_method === 'bank_transfer' && (
              <div className="p-4 rounded-2xl bg-brand-brown-900/40 border border-brand-brown-800 space-y-3">
                <p className="text-xs text-brand-cream-100 leading-relaxed">
                  Please transfer <span className="font-bold text-brand-gold-400">₦{order.total_amount.toLocaleString()}</span> to Zenith Bank account <span className="font-mono font-bold text-brand-gold-400">1223344556</span> (Ella's Kitchen Delicacies) using reference <span className="font-mono font-bold text-brand-gold-400">{order.reference}</span>.
                </p>

                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition"
                >
                  <Building className="w-4 h-4" />
                  <span>I Have Completed the Transfer</span>
                </button>
              </div>
            )}

            {order.payment_method === 'paystack' && (
              <div className="space-y-3">
                {paystackError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
                    {paystackError}
                  </div>
                )}
                <button
                  onClick={handlePayOnlineWithPaystack}
                  disabled={isInitializingPaystack}
                  className="px-6 py-3 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 disabled:opacity-50 text-brand-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isInitializingPaystack ? 'Connecting to Paystack...' : 'Pay with Paystack Online'}</span>
                </button>
              </div>
            )}

            {(order.payment_method === 'cash_on_delivery' || order.payment_method === 'cash_on_pickup') && (
              <p className="text-xs text-brand-brown-300">
                Cash payment will be received upon arrival at your doorstep or our Nyanya kitchen pickup counter.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Items & Fulfilment Details Receipt Card */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 space-y-6 print-card">
        <h2 className="font-serif text-xl font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-4">
          Order Summary &amp; Receipt
        </h2>

        {/* Fulfilment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-brown-300 pb-4 border-b border-brand-brown-800">
          <div>
            <span className="font-bold text-brand-cream-200 block mb-1">Customer Details:</span>
            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            {order.customer_email && <p>{order.customer_email}</p>}
          </div>

          <div>
            <span className="font-bold text-brand-cream-200 block mb-1">Fulfilment Destination:</span>
            <p className="capitalize font-semibold text-brand-gold-400">{order.fulfilment_type}</p>
            {order.delivery_address && <p>{order.delivery_address}</p>}
            {order.delivery_zone && <p className="text-brand-brown-400">Zone: {order.delivery_zone}</p>}
            {order.preferred_time && <p className="text-brand-brown-400">Timing: {order.preferred_time}</p>}
          </div>
        </div>

        {/* Ordered items */}
        <div className="space-y-4">
          {order.items?.map((it, idx) => (
            <div key={idx} className="flex justify-between items-start text-xs border-b border-brand-brown-800/40 pb-3">
              <div>
                <span className="font-bold text-brand-cream-100 text-sm block">
                  {it.quantity}x {it.product_name}
                </span>
                {it.variation_snapshot && (
                  <span className="text-brand-gold-400 block mt-0.5">
                    Portion: {it.variation_snapshot.name}
                  </span>
                )}
                {it.extras_snapshot && it.extras_snapshot.length > 0 && (
                  <span className="text-brand-brown-400 block mt-0.5">
                    Extras: {it.extras_snapshot.map((e) => `${e.name} (x${e.quantity})`).join(', ')}
                  </span>
                )}
              </div>
              <span className="font-semibold text-brand-gold-300 text-sm">
                ₦{it.subtotal.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-2 text-xs">
          <div className="flex justify-between text-brand-brown-300">
            <span>Subtotal</span>
            <span className="font-semibold text-brand-cream-100">₦{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-brand-brown-300">
            <span>Delivery Fee</span>
            <span className="font-semibold text-brand-cream-100">₦{order.delivery_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-brand-gold-400 pt-3 border-t border-brand-brown-800">
            <span>Final Amount</span>
            <span>₦{order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bank Transfer Confirmation Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-brand-cream-50">
              Confirm Bank Transfer
            </h3>
            <p className="text-xs text-brand-brown-300">
              Provide the sender account name or transaction reference so our kitchen finance team can verify and approve preparation promptly.
            </p>

            {transferSuccessMessage && (
              <div className="p-3 bg-green-950/60 border border-green-800 text-green-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{transferSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleConfirmBankTransfer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Sender Account Name <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Name appearing on your bank debit alert"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-3 py-2 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Sender Bank Name (Optional)
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Example: GTBank, Zenith, Access"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-3 py-2 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Additional Notes or Session ID (Optional)
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Reference number or transaction ID"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-3 py-2 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-brand-brown-300 hover:bg-brand-brown-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConfirmingTransfer}
                  className="px-5 py-2 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs"
                >
                  {isConfirmingTransfer ? 'Submitting...' : 'Submit Confirmation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
