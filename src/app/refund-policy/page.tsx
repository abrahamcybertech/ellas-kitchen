import React from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Refund and Cancellation Policy',
  description: "Official refund and cancellation policy for prepared meals, celebration cakes, and catering orders from Ella's Kitchen Abuja.",
  path: '/refund-policy',
});

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-brand-brown-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-cream-50">
          Refund and Cancellation Policy
        </h1>
        <p className="text-xs text-brand-brown-400">
          Last updated: October 2026. Commercial food standards and customer assurance policy.
        </p>
      </div>

      <div className="space-y-6 text-sm text-brand-brown-200 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            1. Fresh Meal Cancellations
          </h2>
          <p>
            Because all meals at Ella's Kitchen are cooked fresh to order, cancellations must be requested within fifteen minutes of order placement. Once cooking and frying have commenced in our kitchen, orders cannot be cancelled for a full refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            2. Quality Assurance and Order Discrepancies
          </h2>
          <p>
            We take immense pride in delivering delicious, hygienic, and perfectly packaged Nigerian dishes. If your delivered order is incomplete, damaged during transit, or differs from your verified order selection, please notify our customer desk within two hours of receipt with clear photographic reference.
          </p>
          <p>
            Upon verification by our dispatch team, we will immediately provide a complimentary replacement dispatch or issue a prompt refund via your original payment channel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            3. Celebration Cakes and Large Catering Trays
          </h2>
          <p>
            Custom celebration cakes and catering buffet trays require dedicated ingredient procurement and custom pastry preparation. Cancellations made at least 24 hours prior to delivery qualify for a full refund. Cancellations made under 24 hours qualify for a partial credit voucher.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            4. Refund Processing Timeframes
          </h2>
          <p>
            Approved refunds processed via Paystack or direct bank transfer are initiated within 24 to 48 banking hours. You will receive electronic notification and transaction reference upon completion.
          </p>
        </section>
      </div>
    </div>
  );
}
