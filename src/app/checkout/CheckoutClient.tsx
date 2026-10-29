'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { BusinessSettings, PaymentMethod, FulfilmentType } from '@/lib/types';
import {
  Truck,
  Store,
  CreditCard,
  Building,
  Banknote,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface CheckoutClientProps {
  settings: BusinessSettings;
}

export default function CheckoutClient({ settings }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [fulfilmentType, setFulfilmentType] = useState<FulfilmentType>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    settings.delivery_zones[0]?.id || 'zone_nyanya'
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedZone = settings.delivery_zones.find((z) => z.id === selectedZoneId) || settings.delivery_zones[0];
  const deliveryFee = fulfilmentType === 'delivery' ? (selectedZone?.fee || 2000) : 0;
  const grandTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-brown-900 mx-auto flex items-center justify-center text-brand-gold-400">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-brand-cream-50">Your Tray is Empty</h2>
        <p className="text-sm text-brand-brown-300">
          Please select delicious dishes or treats from our menu before proceeding to guest checkout.
        </p>
        <Link
          href="/menu"
          className="inline-block px-8 py-3 rounded-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow transition"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please provide your full name');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      setErrorMessage('Please provide a valid contact phone number');
      return;
    }

    if (fulfilmentType === 'delivery' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setErrorMessage('Please enter your full delivery street address');
      return;
    }

    if (subtotal < (settings.min_order_amount || 0)) {
      setErrorMessage(`Minimum order value is ₦${(settings.min_order_amount || 0).toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Format items payload
      const orderItemsPayload = items.map((item) => ({
        product_id: item.product_id,
        variation_id: item.selected_variation?.id,
        extras: item.selected_extras.map((e) => ({
          extra_id: e.id,
          quantity: e.quantity,
        })),
        quantity: item.quantity,
        special_instructions: item.special_instructions,
      }));

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        fulfilment_type: fulfilmentType,
        delivery_address: fulfilmentType === 'delivery' ? deliveryAddress.trim() : undefined,
        delivery_zone: fulfilmentType === 'delivery' ? selectedZone?.name : undefined,
        preferred_time: preferredTime.trim() || undefined,
        customer_notes: customerNotes.trim() || undefined,
        payment_method: paymentMethod,
        items: orderItemsPayload,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order');
      }

      const createdOrder = data.data.order;
      const trackingToken = data.data.tracking_token;

      // Clear client cart
      clearCart();

      // Redirect to secure tracking confirmation
      router.push(`/track/${createdOrder.reference}?token=${trackingToken}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong submitting your order');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitOrder}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Details, Fulfilment & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fulfilment Toggle */}
          <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-cream-50 flex items-center gap-2">
              <span>Fulfilment Preference</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFulfilmentType('delivery');
                  if (paymentMethod === 'cash_on_delivery' || paymentMethod === 'cash_on_pickup') {
                    setPaymentMethod('bank_transfer');
                  }
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
                  fulfilmentType === 'delivery'
                    ? 'border-brand-gold-500 bg-brand-gold-500/10 text-brand-cream-50 font-bold'
                    : 'border-brand-brown-800 bg-brand-dark-950 text-brand-brown-300 hover:border-brand-brown-700'
                }`}
              >
                <Truck className="w-6 h-6 text-brand-gold-400" />
                <span className="text-sm">Doorstep Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfilmentType('pickup')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
                  fulfilmentType === 'pickup'
                    ? 'border-brand-gold-500 bg-brand-gold-500/10 text-brand-cream-50 font-bold'
                    : 'border-brand-brown-800 bg-brand-dark-950 text-brand-brown-300 hover:border-brand-brown-700'
                }`}
              >
                <Store className="w-6 h-6 text-brand-gold-400" />
                <span className="text-sm">Kitchen Pickup</span>
              </button>
            </div>

            {fulfilmentType === 'pickup' && (
              <div className="p-4 rounded-xl bg-brand-brown-900/60 border border-brand-brown-800 text-xs text-brand-cream-200 space-y-1">
                <p className="font-bold text-brand-gold-400">Pickup Counter Location:</p>
                <p>{settings.business_address}</p>
                <p className="text-brand-brown-300 pt-1">{settings.pickup_instructions}</p>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-cream-50">
              Customer Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Full Name <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Example: Amaka Johnson"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Phone Number <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Example: 0803 123 4567"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">
                Email Address (Optional for e-receipt copy)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
              />
            </div>

            {fulfilmentType === 'delivery' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Abuja Delivery Zone <span className="text-brand-gold-400">*</span>
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 focus:outline-none focus:border-brand-gold-500 transition"
                  >
                    {settings.delivery_zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} (+₦{zone.fee.toLocaleString()} / {zone.estimated_minutes})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-cream-200">
                    Street Address and Landmarks <span className="text-brand-gold-400">*</span>
                  </label>
                  <textarea
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House number, street name, estate, landmark or apartment number"
                    className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition h-20 resize-none"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Preferred Delivery or Pickup Time
                </label>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="As soon as ready, or 2:00 PM"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Customer Notes or Dietary Requests
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Extra pepper, ring gate bell on arrival"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-cream-50">
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Paystack Online */}
              {settings.paystack_enabled && (
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'paystack'
                      ? 'border-brand-gold-500 bg-brand-gold-500/10'
                      : 'border-brand-brown-800 bg-brand-dark-950 hover:border-brand-brown-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="text-brand-gold-500 focus:ring-brand-gold-500"
                    />
                    <div>
                      <span className="text-sm font-bold block text-brand-cream-50">
                        Paystack Online Payment
                      </span>
                      <span className="text-xs text-brand-brown-300">
                        Instant payment via Nigerian Debit Cards, USSD, or Bank Channels
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-brand-gold-400" />
                </label>
              )}

              {/* Direct Bank Transfer */}
              {settings.bank_transfer_enabled && (
                <label
                  className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-brand-gold-500 bg-brand-gold-500/10'
                      : 'border-brand-brown-800 bg-brand-dark-950 hover:border-brand-brown-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="text-brand-gold-500 focus:ring-brand-gold-500"
                      />
                      <div>
                        <span className="text-sm font-bold block text-brand-cream-50">
                          Direct Bank Transfer
                        </span>
                        <span className="text-xs text-brand-brown-300">
                          Transfer directly to our official restaurant Zenith Bank account
                        </span>
                      </div>
                    </div>
                    <Building className="w-5 h-5 text-brand-gold-400" />
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-3 bg-brand-dark-950 rounded-xl border border-brand-brown-800 text-xs space-y-1 mt-1">
                      <p className="text-brand-gold-400 font-bold">Kitchen Bank Details:</p>
                      <p className="text-brand-cream-200">
                        Bank: <span className="font-semibold">{settings.bank_details.bank_name}</span>
                      </p>
                      <p className="text-brand-cream-200">
                        Account Number: <span className="font-mono font-bold text-brand-gold-300">{settings.bank_details.account_number}</span>
                      </p>
                      <p className="text-brand-cream-200">
                        Account Name: <span className="font-semibold">{settings.bank_details.account_name}</span>
                      </p>
                    </div>
                  )}
                </label>
              )}

              {/* Cash on Kitchen Pickup */}
              {fulfilmentType === 'pickup' && settings.cash_on_pickup_enabled && (
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'cash_on_pickup'
                      ? 'border-brand-gold-500 bg-brand-gold-500/10'
                      : 'border-brand-brown-800 bg-brand-dark-950 hover:border-brand-brown-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash_on_pickup"
                      checked={paymentMethod === 'cash_on_pickup'}
                      onChange={() => setPaymentMethod('cash_on_pickup')}
                      className="text-brand-gold-500 focus:ring-brand-gold-500"
                    />
                    <div>
                      <span className="text-sm font-bold block text-brand-cream-50">
                        Pay upon Kitchen Pickup
                      </span>
                      <span className="text-xs text-brand-brown-300">
                        Settle payment in person when collecting your meal
                      </span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-brand-gold-400" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-5 bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-6 sticky top-24 space-y-6">
          <h2 className="font-serif text-xl font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-4">
            Order Review
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs border-b border-brand-brown-800/40 pb-2">
                <div className="flex-1 pr-2">
                  <span className="font-bold text-brand-cream-100 block">
                    {item.quantity}x {item.product_name}
                  </span>
                  {item.selected_variation && (
                    <span className="text-brand-gold-400 block">{item.selected_variation.name}</span>
                  )}
                  {item.selected_extras && item.selected_extras.length > 0 && (
                    <span className="text-brand-brown-400 block">
                      +{item.selected_extras.map((e) => `${e.name} (x${e.quantity})`).join(', ')}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-brand-gold-300 whitespace-nowrap">
                  ₦{item.item_total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-brown-800 text-sm">
            <div className="flex justify-between text-brand-brown-300 text-xs">
              <span>Items Subtotal</span>
              <span className="font-semibold text-brand-cream-100">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-brand-brown-300 text-xs">
              <span>Fulfilment ({fulfilmentType === 'delivery' ? selectedZone?.name : 'Kitchen Pickup'})</span>
              <span className="font-semibold text-brand-cream-100">
                {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-brand-gold-400 pt-3 border-t border-brand-brown-800">
              <span>Total Payable</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 disabled:opacity-50 text-brand-dark-950 font-extrabold text-base shadow-gold-glow flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Confirming Your Order...</span>
            ) : (
              <>
                <span>Place Order (₦{grandTotal.toLocaleString()})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="space-y-2 pt-2 text-[11px] text-brand-brown-400 text-center">
            <div className="flex items-center justify-center gap-1.5 text-brand-gold-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Guest Ordering with Cryptographic Tracking</span>
            </div>
            <p>
              Your order is recorded securely. You will immediately receive a verifiable tracking reference to follow preparation in real time.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
