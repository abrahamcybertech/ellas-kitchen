import React from 'react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms and Conditions',
  description: "Terms and conditions governing food ordering, delivery, pickup, and catering services at Ella's Kitchen Abuja.",
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-brand-brown-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-cream-50">
          Terms and Conditions
        </h1>
        <p className="text-xs text-brand-brown-400">
          Last updated: October 2026. Standard commercial agreement for Ella's Kitchen customers.
        </p>
      </div>

      <div className="space-y-6 text-sm text-brand-brown-200 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            1. Ordering and Fulfilment
          </h2>
          <p>
            By submitting an order through the Ella's Kitchen ordering platform, you confirm that all contact and delivery information provided is accurate. Orders are prepared fresh upon receipt and confirmation of payment terms.
          </p>
          <p>
            Delivery time estimates vary based on traffic patterns in Abuja, preparation requirements, and order volume. We exert diligent effort to deliver within stated target windows.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            2. Menu Pricing and Availability
          </h2>
          <p>
            All prices are stated in Nigerian Naira (₦). Product availability, seasonal ingredients, and price modifiers are updated dynamically through our kitchen management system. If an ordered item becomes unavailable prior to cooking, our staff will contact you immediately to arrange a suitable substitute or refund.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            3. Payment and Bank Transfers
          </h2>
          <p>
            Payments made via bank transfer must reference your unique order reference code. Preparation begins upon verification of transfer by our kitchen team. For cash on pickup orders, exact cash or immediate transfer at handover is required.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            4. Catering and Event Bookings
          </h2>
          <p>
            Large catering trays, small chops platters, and custom celebration cakes require adequate advance notice as indicated on product listings. Cancellations for large catering orders must be communicated at least 24 hours prior to scheduled delivery.
          </p>
        </section>
      </div>
    </div>
  );
}
